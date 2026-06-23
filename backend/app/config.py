# from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent.parent
# UPLOAD_DIR = BASE_DIR / "uploads"
# WEIGHTS_DIR = BASE_DIR / "weights"
# MODEL_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2.pth"

# UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
# WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

# CLASS_NAMES = ["jaundice", "normal"]
# CLASS_MAP_PATH = WEIGHTS_DIR / "class_to_idx.json"
# IMG_SIZE = 224
# MODEL_CONFIDENCE_THRESHOLD = 0.60

# from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent.parent
# UPLOAD_DIR = BASE_DIR / "uploads"
# WEIGHTS_DIR = BASE_DIR / "weights"
# MODEL_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2.pth"
# CLASS_MAP_PATH = WEIGHTS_DIR / "class_to_idx.json"

# UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
# WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

# IMG_SIZE = 224

# UNCERTAIN_THRESHOLD = 0.55
# STRONG_CONFIDENCE_THRESHOLD = 0.70
# MODEL_CONFIDENCE_THRESHOLD = 0.60




# from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent.parent
# UPLOAD_DIR = BASE_DIR / "uploads"
# WEIGHTS_DIR = BASE_DIR / "weights"
# MODEL_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2.pth"
# CLASS_MAP_PATH = WEIGHTS_DIR / "class_to_idx.json"

# UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
# WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

# IMG_SIZE = 224

# UNCERTAIN_THRESHOLD = 0.55
# STRONG_CONFIDENCE_THRESHOLD = 0.70
# MODEL_CONFIDENCE_THRESHOLD = 0.60
# NORMAL_REASSURANCE_THRESHOLD = 0.65



from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
WEIGHTS_DIR = BASE_DIR / "weights"
DATA_STORE_DIR = BASE_DIR / "data_store"

MODEL_PATH = WEIGHTS_DIR / "jaundice_mobilenetv2.pth"
CLASS_MAP_PATH = WEIGHTS_DIR / "class_to_idx.json"

BABY_PROFILE_PATH = DATA_STORE_DIR / "baby_profile.json"
SCREENINGS_PATH = DATA_STORE_DIR / "screenings.json"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_STORE_DIR.mkdir(parents=True, exist_ok=True)

IMG_SIZE = 224

UNCERTAIN_THRESHOLD = 0.55
STRONG_CONFIDENCE_THRESHOLD = 0.70
MODEL_CONFIDENCE_THRESHOLD = 0.60
NORMAL_REASSURANCE_THRESHOLD = 0.65
MODEL_JAUNDICE_THRESHOLD = 0.45
MODEL_UNCERTAIN_MARGIN = 0.10