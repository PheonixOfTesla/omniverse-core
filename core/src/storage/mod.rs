//! STORAGE MODULE
//! Encrypted local storage with SQL-cipher
//! User-derived encryption keys - no cloud dependency

pub mod sqlite_cipher;

pub use sqlite_cipher::SecureStorage;
