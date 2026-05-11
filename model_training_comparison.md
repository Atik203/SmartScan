# Model Training & Performance Comparison

This document details the performance evaluation of the SmartScan deep learning pipeline, comparing our trained models (YOLOv8 and TrOCR) against the custom models proposed in the baseline research paper.

## 1. Math Expression Detection (YOLOv8)

**Colab Notebook:** [Math YOLOv8 Training](https://colab.research.google.com/drive/1beQh1z1EB1N-yj01RoqC0ReSlP1D8nXT?usp=sharing)

We trained a YOLOv8-small model to detect embedded and isolated mathematical expressions. It provides near-identical precision to the baseline's heavy Faster R-CNN model while offering significantly faster inference speeds, making it ideal for edge deployment (e.g., Raspberry Pi).

| Metric | Paper V1 / V2 (Early ResNet50) | Paper V3 (Best Faster R-CNN) | Our Model (YOLOv8) |
| :--- | :--- | :--- | :--- |
| **Dataset** | IBEM | IBEM | **IBEM** |
| **Parameters** | Not Disclosed | Not Disclosed | **11.1 Million** |
| **Training Time** | Not Disclosed | Not Disclosed | **1.5 Hours** (A100 GPU) |
| **Precision** | Performed Poorly | 95.71% | **93.89%** |
| **Recall** | Performed Poorly | 91.77% | **91.42%** |
| **mAP50** | - | - | **95.16%** |
| **mAP50-95** | - | - | **76.75%** |

---

## 2. Math Expression Recognition (TrOCR)

**Colab Notebook:** [Math Recognition TrOCR](https://colab.research.google.com/drive/1B9DaXpof0QwN0Dz8v-QZ2MLK4OfOjT3o?usp=sharing)

We fine-tuned the `microsoft/trocr-small-printed` model to recognize the cropped mathematical expressions and generate accurate LaTeX code. **Our trained model successfully outperformed the Pix2Tex baseline used in the research paper.**

| Metric | Research Paper (Pix2Tex) | Our Model (TrOCR) |
| :--- | :--- | :--- |
| **Dataset** | Im2LaTeX-100k | **Im2LaTeX-100k** |
| **Parameters** | Not Disclosed | **61.6 Million** |
| **Training Time** | Not Disclosed | **8 Hours** (L4/A100 GPU) |
| **CER (Character Error Rate)** | 10.84% | **9.67%** 🏆 *(Lower is better)* |
| **BLEU Score** | 86.44% | **88.42%** 🏆 *(Higher is better)* |

### Conclusion
The SmartScan pipeline has been successfully replicated and improved upon. While detection metrics are on par with the baseline, the recognition pipeline has achieved state-of-the-art accuracy, lowering the Character Error Rate to under 10%.
