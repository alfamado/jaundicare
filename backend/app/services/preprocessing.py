from PIL import Image
from torchvision import transforms
from app.config import IMG_SIZE


def build_inference_transform():
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


def load_image(image_path: str) -> Image.Image:
    image = Image.open(image_path).convert("RGB")
    return image