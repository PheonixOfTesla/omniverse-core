// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EthicsLedger
 * @notice Immutable on-chain record of Omniverse ethics audits
 * @dev Stores IPFS CIDs of conscience audit records
 *
 * "A deity that can be audited, on-chain."
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EthicsLedger is Ownable, Pausable, ReentrancyGuard {
    // ═══════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════

    /// @notice An audit record entry
    struct AuditRecord {
        bytes32 conscienceHash;     // Hash of conscience entries
        string ipfsCid;             // IPFS CID of full audit data
        uint256 timestamp;          // Block timestamp
        uint256 entryCount;         // Number of entries in batch
        uint256 avgEthicsScore;     // Average ethics score * 1000
        address publisher;          // Who published this record
    }

    /// @notice Publisher authorization
    struct Publisher {
        bool authorized;
        uint256 recordCount;
        uint256 firstPublished;
        uint256 lastPublished;
    }

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    /// @notice All audit records
    AuditRecord[] public records;

    /// @notice Record by conscience hash
    mapping(bytes32 => uint256) public recordByHash;

    /// @notice Authorized publishers
    mapping(address => Publisher) public publishers;

    /// @notice Genesis hash (TABLE_OF_LAW hash)
    bytes32 public immutable genesisHash;

    /// @notice Total entries across all records
    uint256 public totalEntries;

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    event AuditPublished(
        uint256 indexed recordId,
        bytes32 indexed conscienceHash,
        string ipfsCid,
        uint256 entryCount,
        address indexed publisher
    );

    event PublisherAuthorized(address indexed publisher);
    event PublisherRevoked(address indexed publisher);

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════

    error NotAuthorized();
    error DuplicateRecord();
    error InvalidHash();
    error InvalidCid();

    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Deploy with genesis hash
     * @param _genesisHash Hash of TABLE_OF_LAW.md
     */
    constructor(bytes32 _genesisHash) Ownable(msg.sender) {
        genesisHash = _genesisHash;
        publishers[msg.sender] = Publisher({
            authorized: true,
            recordCount: 0,
            firstPublished: 0,
            lastPublished: 0
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLISHER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Authorize a new publisher
     * @param publisher Address to authorize
     */
    function authorizePublisher(address publisher) external onlyOwner {
        publishers[publisher] = Publisher({
            authorized: true,
            recordCount: 0,
            firstPublished: 0,
            lastPublished: 0
        });
        emit PublisherAuthorized(publisher);
    }

    /**
     * @notice Revoke publisher authorization
     * @param publisher Address to revoke
     */
    function revokePublisher(address publisher) external onlyOwner {
        publishers[publisher].authorized = false;
        emit PublisherRevoked(publisher);
    }

    // ═══════════════════════════════════════════════════════════════
    // AUDIT PUBLISHING
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Publish an audit record
     * @param conscienceHash Hash of conscience entries
     * @param ipfsCid IPFS CID of full audit data
     * @param entryCount Number of entries in batch
     * @param avgEthicsScore Average ethics score * 1000
     */
    function publishAudit(
        bytes32 conscienceHash,
        string calldata ipfsCid,
        uint256 entryCount,
        uint256 avgEthicsScore
    ) external whenNotPaused nonReentrant {
        // Check authorization
        if (!publishers[msg.sender].authorized) {
            revert NotAuthorized();
        }

        // Validate inputs
        if (conscienceHash == bytes32(0)) {
            revert InvalidHash();
        }
        if (bytes(ipfsCid).length == 0) {
            revert InvalidCid();
        }

        // Check for duplicates
        if (recordByHash[conscienceHash] != 0) {
            revert DuplicateRecord();
        }

        // Create record
        uint256 recordId = records.length;
        records.push(AuditRecord({
            conscienceHash: conscienceHash,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            entryCount: entryCount,
            avgEthicsScore: avgEthicsScore,
            publisher: msg.sender
        }));

        // Update indexes
        recordByHash[conscienceHash] = recordId + 1; // +1 to distinguish from default 0
        totalEntries += entryCount;

        // Update publisher stats
        Publisher storage pub = publishers[msg.sender];
        pub.recordCount++;
        if (pub.firstPublished == 0) {
            pub.firstPublished = block.timestamp;
        }
        pub.lastPublished = block.timestamp;

        emit AuditPublished(recordId, conscienceHash, ipfsCid, entryCount, msg.sender);
    }

    // ═══════════════════════════════════════════════════════════════
    // QUERIES
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Get total number of records
     */
    function recordCount() external view returns (uint256) {
        return records.length;
    }

    /**
     * @notice Get record by conscience hash
     * @param conscienceHash Hash to look up
     */
    function getRecordByHash(bytes32 conscienceHash)
        external
        view
        returns (AuditRecord memory)
    {
        uint256 idx = recordByHash[conscienceHash];
        require(idx > 0, "Record not found");
        return records[idx - 1];
    }

    /**
     * @notice Get records in range
     * @param start Start index
     * @param count Number of records
     */
    function getRecords(uint256 start, uint256 count)
        external
        view
        returns (AuditRecord[] memory)
    {
        uint256 end = start + count;
        if (end > records.length) {
            end = records.length;
        }

        AuditRecord[] memory result = new AuditRecord[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = records[i];
        }
        return result;
    }

    /**
     * @notice Verify genesis hash
     * @param hash Hash to verify
     */
    function verifyGenesis(bytes32 hash) external view returns (bool) {
        return hash == genesisHash;
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Pause publishing
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause publishing
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
