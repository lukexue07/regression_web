# File: backend/app.py
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from regression import compute_regression

app = Flask(__name__, static_folder="../static", template_folder="../templates")
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/regress', methods=['POST'])
def regress():
    data = request.get_json(force=True)
    X = data.get('X')
    Y = data.get('Y')

    if not X or not Y or len(X) != len(Y):
        return jsonify({'error': 'Invalid data'}), 400

    try:
        coefficients = compute_regression(X, Y)
        return jsonify({'coefficients': coefficients})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
