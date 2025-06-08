# File: backend/app.py
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import numpy as np

def gs_coefficient(v1, v2):
    v1 = v1.reshape(-1, 1)
    v2 = v2.reshape(-1, 1)
    return np.dot(v2.T, v1) / np.dot(v1.T, v1) 
#Your gs_coefficient assumes NumPy dot product will always yield correct scalar values. But if you input row vectors instead of column vectors, results can be misaligned.

def proj(v1, v2):
    return np.multiply(gs_coefficient(v1, v2), v1)  # Element-wise multiplication

def gs(X):
    Y = []
    for i in range(len(X)):
        temp_vec = X[i].copy()  # Copy to avoid modification issues
        for inY in Y:
            proj_vec = proj(inY, X[i])
            temp_vec = temp_vec - proj_vec  # Element-wise subtraction
        if np.any(temp_vec):
            Y.append(temp_vec)  #if temp_vec is not empty, we add it to Y
    return np.array(Y)  # Convert list to NumPy array

app = Flask(__name__, static_folder="../static", template_folder="../templates")
CORS(app)

@app.route('/') #when user accesses homepage aka normal url it does this aka runs the index.html file
def index():
    return render_template('index.html')

@app.route('/regress', methods=['POST']) #when user accesses website plus the /regress at the end it runs this function
def regress():
    #post is sending data to server, get is retrieving data from server, server is like backend ish
    data = request.get_json(force=True)
    pwr = data.get('pwr')
    X = data.get('X')
    Y = data.get('Y')
    if not X or not Y or len(X) != len(Y):
        return jsonify({'error': 'Invalid data'}), 400

    try: 
        y_vec = np.matrix(Y)
        y_vec = np.transpose(y_vec)
        givens = []
        for i in range(len(X)):
            row = []
            for j in range(len(X[i])):
                power = pwr[j]
                for pow in range(power):
                    row.append(X[i][j]**(power-pow))
            row.append(1)
            givens.append(row)

        if (len(givens) < len(givens[0])):
            return jsonify({'error': "Singular matrix"}), 500 #????
        
        matrix = np.matrix(givens)
        transpose = np.transpose(matrix)
        vectors = np.matrix(X).transpose()

        square = np.matmul(transpose,matrix)
        inv = np.linalg.inv(square)
        coeffs = np.matmul(np.matmul(inv,transpose), y_vec)
        ortho_basis = gs(vectors)

        y_hat = np.matmul(matrix, coeffs)
        y_mean = np.mean(y_vec)
        SST = np.dot(np.transpose(y_vec - y_mean), y_vec - y_mean)[0,0]
        SSR = np.dot(np.transpose(y_vec - y_hat), y_vec - y_hat)[0,0]
        
        # Compute R^2
        R2 = 1 - (SSR / SST)
        
        return jsonify({'coeffs': coeffs.tolist(), 'r2': R2, 'lindep': len(vectors.T)-len(ortho_basis.T)}) #only can pass 1 dictionary into jsonify
    except Exception as e:
        print(str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
