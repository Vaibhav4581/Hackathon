from backend.image_ai import image_similarity
from backend.text_ai import text_similarity


def final_similarity(desc1, desc2, img1=None, img2=None):

    text_point = text_similarity(desc1, desc2)

    # If both images exist
    if img1 and img2:
        image_point = image_similarity(img1, img2)
        final_score = (0.6 * image_point) + (0.4 * text_point)

    else:
        final_score = text_point

    return final_score