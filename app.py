import os
from flask import Flask, flash, request, redirect, Markup, render_template
from flask_cors import CORS
from skimage.feature import hog
from skimage.io import imread
from skimage.transform import resize
import skimage
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import StandardScaler
import numpy as np
import pickle
import uuid

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}


app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = "static/uploads"
app.secret_key = str(uuid.uuid4())

with open('model.pkl', 'rb') as file:
    MODEL = pickle.load(file)

class RGB2GrayTransformer(BaseEstimator, TransformerMixin):
    """
    Convert an array of RGB images to grayscale
    """

    def __init__(self):
        pass

    def fit(self, X, y=None):
        """returns itself"""
        return self

    def transform(self, X, y=None):
        """perform the transformation and return an array"""
        return np.array([skimage.color.rgb2gray(img) for img in X])

class HogTransformer(BaseEstimator, TransformerMixin):
    """
    Expects an array of 2d arrays (1 channel images)
    Calculates hog features for each img
    """

    def __init__(self, y=None, orientations=9,
                 pixels_per_cell=(8, 8),
                 cells_per_block=(3, 3), block_norm='L2-Hys'):
        self.y = y
        self.orientations = orientations
        self.pixels_per_cell = pixels_per_cell
        self.cells_per_block = cells_per_block
        self.block_norm = block_norm

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):

        def local_hog(X):
            return hog(X,
                       orientations=self.orientations,
                       pixels_per_cell=self.pixels_per_cell,
                       cells_per_block=self.cells_per_block,
                       block_norm=self.block_norm)

        try: # parallel
            return np.array([local_hog(img) for img in X])
        except:
            return np.array([local_hog(img) for img in X])

grayify = RGB2GrayTransformer()
hogify = HogTransformer(
    pixels_per_cell=(14, 14),
    cells_per_block=(2,2),
    orientations=9,
    block_norm='L2-Hys'
)
scalify = StandardScaler()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    file = request.files['file']
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    if file and allowed_file(file.filename):
        filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        im = imread(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        im = resize(im, (100, 100))
        x = grayify.fit_transform(np.array([im]))
        x = hogify.fit_transform(x)
        x = scalify.fit_transform(x)

        prediction = MODEL.predict(x)[0]
        out = {
                'prediction': prediction,
                'filename': filename
                }

        return out, 200
    else:
        flash('Filetype not allowed')
        return redirect(request.url)

@app.route('/predict', methods=['GET'])
def friendly_api():
    return '''
    <!DOCTYPE html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == "__main__":
	port = int(os.environ.get("PORT", 80))
	app.run(host='0.0.0.0', port=port)
