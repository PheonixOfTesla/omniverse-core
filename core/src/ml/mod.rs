//! ML MODULE
//! On-device ONNX inference engine
//! <40ms latency target for all models

pub mod onnx_runner;

pub use onnx_runner::ModelRunner;
