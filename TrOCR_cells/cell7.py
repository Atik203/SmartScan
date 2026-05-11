# ==============================================================================
# CELL 7 — Evaluate Accuracy & Performance
# ==============================================================================
import torch
from tqdm.auto import tqdm
import evaluate

print('[INFO] Running standard evaluation on validation set...')
try:
    eval_metrics = trainer.evaluate()
    print(f"Validation Loss: {eval_metrics.get('eval_loss', 'N/A'):.4f}")
except Exception as e:
    print(f"[WARN] Standard evaluation failed or trainer not loaded: {e}")

try:
    print('[INFO] Loading metrics (CER and BLEU)...')
    cer_metric = evaluate.load("cer")
    bleu_metric = evaluate.load("bleu")
    
    print('[INFO] Computing CER and BLEU on a subset of validation data...')
    model.eval()
    predictions = []
    references = []
    
    # Run over a subset (e.g., 100 samples) to evaluate quickly
    num_samples = min(100, len(eval_dataset))
    
    with torch.no_grad():
        for i in tqdm(range(num_samples)):
            sample = eval_dataset[i]
            # Handle pixel_values whether they are tensors or lists
            pixel_values = sample['pixel_values']
            if not isinstance(pixel_values, torch.Tensor):
                pixel_values = torch.tensor(pixel_values)
            
            pixel_values = pixel_values.unsqueeze(0).to(model.device)
            labels = sample['labels']
            if not isinstance(labels, torch.Tensor):
                labels = torch.tensor(labels)
            
            # Generate prediction
            generated_ids = model.generate(pixel_values, max_length=64, early_stopping=True, num_beams=4)
            pred_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            # Decode reference
            labels[labels == -100] = processor.tokenizer.pad_token_id
            ref_text = processor.decode(labels, skip_special_tokens=True)
            
            predictions.append(pred_text.strip())
            references.append(ref_text.strip())
            
    cer_score = cer_metric.compute(predictions=predictions, references=references)
    bleu_score = bleu_metric.compute(predictions=predictions, references=[[r] for r in references])
    
    print("\n" + "="*40)
    print("         PERFORMANCE METRICS")
    print("="*40)
    print(f"Character Error Rate (CER): {cer_score:.4f} (Lower is better)")
    print(f"BLEU Score                : {bleu_score['bleu']:.4f} (Higher is better)")
    print("="*40)
    
    print("\n--- Sample Predictions ---")
    for i in range(min(5, num_samples)):
        print(f"Target : {references[i]}")
        print(f"Predict: {predictions[i]}")
        print("-" * 40)
        
except ImportError:
    print('\n[ERROR] Missing required packages for CER/BLEU computation.')
    print('Please run this command in a new cell first:')
    print('!pip install evaluate jiwer')
except Exception as e:
    print(f"\n[ERROR] Evaluation encountered an issue: {e}")
