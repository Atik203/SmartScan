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
model.config.max_length             = 64
model.config.early_stopping         = True
model.config.num_beams              = 4

print('[OK] Model ready.')
print(f'     Vocab size : {model.config.vocab_size}')
print(f'     Max length : {model.config.max_length}')
print(f'     Num beams  : {model.config.num_beams}')
