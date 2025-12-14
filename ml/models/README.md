# Omniverse ML Models

## Overview

All ML models run **locally** on-device. No cloud inference.

## Model Specifications

| Model | Size | Latency Target | Purpose |
|-------|------|----------------|---------|
| text-embedding-q8.onnx | ~23MB | <10ms | Semantic search, similarity |
| sentiment-q8.onnx | ~5MB | <5ms | Feedback analysis |
| intent-q8.onnx | ~8MB | <5ms | Query classification |
| ner-q8.onnx | ~12MB | <10ms | Entity extraction |
| activity-predictor-q8.onnx | ~3MB | <3ms | Activity inference |
| ranker-q8.onnx | ~5MB | <5ms | Recommendation ranking |

## Quantization

All models use INT8 quantization for:
- Smaller file size (3-4x reduction)
- Faster inference (2-3x speedup)
- Lower memory usage
- Minimal accuracy loss (<1%)

## Verification

Before loading any model:

```rust
let expected_hash = checksums.get(model_name)?;
let actual_hash = sha256_file(model_path);
if expected_hash != actual_hash {
    bail!("Model integrity check failed!");
}
```

## Downloading Models

Models are NOT included in the repository. Download with:

```bash
make download-models
```

Or manually:

```bash
# From HuggingFace
huggingface-cli download omniverse-ai/models --local-dir ./ml/models

# Verify
sha256sum -c checksums.sha256
```

## Custom Training

Intent and activity models are custom-trained on Phoenix data:

1. Export training data: `omniverse export --training-data`
2. Train locally: `python train.py --model intent`
3. Quantize: `python quantize.py --input model.onnx --output model-q8.onnx`
4. Update checksum: `sha256sum model-q8.onnx >> checksums.sha256`
5. Sign: `make sign-models`

## Privacy

- Models are trained on **aggregated, anonymized** data
- No PII in model weights
- Inference is 100% local
- No telemetry, no cloud calls
