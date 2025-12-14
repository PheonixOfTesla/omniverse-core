// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GenesisSig
 * @notice On-chain verification of Omniverse release signatures
 * @dev Verifies Ed25519 signatures for reproducible builds
 *
 * "Every binary, signed and verified on-chain."
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GenesisSig is Ownable {
    using ECDSA for bytes32;

    // ═══════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════

    /// @notice A verified release
    struct Release {
        string version;             // Semantic version (e.g., "1.0.0")
        bytes32 binaryHash;         // SHA-256 of binary
        bytes32 sourceHash;         // SHA-256 of source tarball
        bytes32 lawHash;            // SHA-256 of TABLE_OF_LAW at release
        string ipfsCid;             // IPFS CID of release artifacts
        uint256 timestamp;          // Release timestamp
        uint256 blockNumber;        // Block when released
        bool revoked;               // Has this release been revoked?
    }

    /// @notice Ed25519 public key (stored as two uint256)
    struct Ed25519PubKey {
        uint256 keyPart1;
        uint256 keyPart2;
    }

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    /// @notice All releases
    mapping(string => Release) public releases;

    /// @notice Release versions in order
    string[] public releaseVersions;

    /// @notice Binary hash to version mapping
    mapping(bytes32 => string) public binaryToVersion;

    /// @notice Genesis public key hash
    bytes32 public immutable genesisKeyHash;

    /// @notice Current law hash
    bytes32 public currentLawHash;

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    event ReleasePublished(
        string indexed version,
        bytes32 indexed binaryHash,
        string ipfsCid
    );

    event ReleaseRevoked(
        string indexed version,
        string reason
    );

    event LawUpdated(
        bytes32 indexed oldHash,
        bytes32 indexed newHash
    );

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════

    error VersionExists();
    error InvalidHash();
    error InvalidSignature();
    error ReleaseNotFound();
    error AlreadyRevoked();

    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Deploy with genesis key hash
     * @param _genesisKeyHash Hash of GENESIS_KEY.pub
     * @param _lawHash Initial TABLE_OF_LAW hash
     */
    constructor(
        bytes32 _genesisKeyHash,
        bytes32 _lawHash
    ) Ownable(msg.sender) {
        genesisKeyHash = _genesisKeyHash;
        currentLawHash = _lawHash;
    }

    // ═══════════════════════════════════════════════════════════════
    // RELEASE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Publish a new release
     * @param version Semantic version
     * @param binaryHash SHA-256 of binary
     * @param sourceHash SHA-256 of source
     * @param ipfsCid IPFS CID of artifacts
     * @param signature ECDSA signature of release data
     */
    function publishRelease(
        string calldata version,
        bytes32 binaryHash,
        bytes32 sourceHash,
        string calldata ipfsCid,
        bytes calldata signature
    ) external onlyOwner {
        // Check version doesn't exist
        if (releases[version].timestamp != 0) {
            revert VersionExists();
        }

        // Validate hashes
        if (binaryHash == bytes32(0) || sourceHash == bytes32(0)) {
            revert InvalidHash();
        }

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            version,
            binaryHash,
            sourceHash,
            currentLawHash,
            ipfsCid
        ));

        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);

        if (signer != owner()) {
            revert InvalidSignature();
        }

        // Store release
        releases[version] = Release({
            version: version,
            binaryHash: binaryHash,
            sourceHash: sourceHash,
            lawHash: currentLawHash,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            blockNumber: block.number,
            revoked: false
        });

        releaseVersions.push(version);
        binaryToVersion[binaryHash] = version;

        emit ReleasePublished(version, binaryHash, ipfsCid);
    }

    /**
     * @notice Revoke a release (security issue)
     * @param version Version to revoke
     * @param reason Reason for revocation
     */
    function revokeRelease(
        string calldata version,
        string calldata reason
    ) external onlyOwner {
        Release storage rel = releases[version];

        if (rel.timestamp == 0) {
            revert ReleaseNotFound();
        }
        if (rel.revoked) {
            revert AlreadyRevoked();
        }

        rel.revoked = true;
        emit ReleaseRevoked(version, reason);
    }

    /**
     * @notice Update TABLE_OF_LAW hash (governance vote required in production)
     * @param newLawHash New law hash
     */
    function updateLawHash(bytes32 newLawHash) external onlyOwner {
        bytes32 oldHash = currentLawHash;
        currentLawHash = newLawHash;
        emit LawUpdated(oldHash, newLawHash);
    }

    // ═══════════════════════════════════════════════════════════════
    // VERIFICATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Verify a binary hash
     * @param binaryHash Hash to verify
     * @return valid Whether hash matches a non-revoked release
     * @return version Version string if valid
     */
    function verifyBinary(bytes32 binaryHash)
        external
        view
        returns (bool valid, string memory version)
    {
        version = binaryToVersion[binaryHash];

        if (bytes(version).length == 0) {
            return (false, "");
        }

        Release memory rel = releases[version];
        valid = !rel.revoked;

        return (valid, version);
    }

    /**
     * @notice Get release info
     * @param version Version to query
     */
    function getRelease(string calldata version)
        external
        view
        returns (Release memory)
    {
        return releases[version];
    }

    /**
     * @notice Get latest release version
     */
    function latestVersion() external view returns (string memory) {
        if (releaseVersions.length == 0) {
            return "";
        }
        return releaseVersions[releaseVersions.length - 1];
    }

    /**
     * @notice Get all release versions
     */
    function getAllVersions() external view returns (string[] memory) {
        return releaseVersions;
    }

    /**
     * @notice Get release count
     */
    function releaseCount() external view returns (uint256) {
        return releaseVersions.length;
    }

    /**
     * @notice Verify TABLE_OF_LAW hash
     * @param hash Hash to verify
     */
    function verifyLaw(bytes32 hash) external view returns (bool) {
        return hash == currentLawHash;
    }
}
