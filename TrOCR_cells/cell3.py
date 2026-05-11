# ==============================================================================
# CELL 3 — Initialize TrOCR Model
# ==============================================================================
from transformers import VisionEncoderDecoderModel

print('[INFO] Loading TrOCR model...')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-small-printed')

# Configure decoding tokens for LaTeX
model.config.decoder_start_token_id = processor.tokenizer.cls_token_id
model.config.pad_token_id           = processor.tokenizer.pad_token_id
model.config.vocab_size             = model.config.decoder.vocab_size
model.config.eos_token_id           = processor.tokenizer.sep_token_id

# Setup generation_config (required by newer transformers versions)
model.generation_config.max_length             = 64
model.generation_config.early_stopping         = True
model.generation_config.num_beams              = 4
model.generation_config.decoder_start_token_id = processor.tokenizer.cls_token_id
model.generation_config.pad_token_id           = processor.tokenizer.pad_token_id
model.generation_config.eos_token_id           = processor.tokenizer.sep_token_id

# Remove from config if they exist to prevent ValueError during save
for param in ['max_length', 'early_stopping', 'num_beams']:
    if hasattr(model.config, param):
        delattr(model.config, param)

print('[OK] Model ready.')
print(f'     Vocab size : {model.config.vocab_size}')
print(f'     Max length : {model.generation_config.max_length}')
print(f'     Num beams  : {model.generation_config.num_beams}')
