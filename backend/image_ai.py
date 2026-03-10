import torch
import clip
from PIL import Image
from sklearn.metrics.pairwise import cosine_similarity

device = "cuda" if torch.cuda.is_available() else "cpu"

model, preprocess = clip.load("ViT-B/32",device=device)

def get_image_embedding(image_path):

    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)

    with torch.no_grad():
        embedding = model.encode_image(image)

    return embedding.cpu().numpy()

def image_similarity(img1,img2):

    emb1= get_image_embedding(img1)
    emb2= get_image_embedding(img2)

    score = cosine_similarity(emb1,emb2)[0][0]

    return score