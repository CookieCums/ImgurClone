from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'bin')
app.config['ALLOWED_EXTENSIONS'] = {'gif', 'png', 'jpg', 'jpeg'}
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max upload size
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def file_size(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    return os.path.getsize(file_path)

@app.route('/')
def index():
    media_files = os.listdir(app.config['UPLOAD_FOLDER'])
    return render_template('index.html', media_files=media_files, file_size=file_size)

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files[]' not in request.files:
        return jsonify({'status': 'error', 'message': 'No files uploaded'}), 400
    files = request.files.getlist('files[]')
    saved_files = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            saved_files.append(filename)

    return jsonify({'status': 'success', 'files': saved_files}), 200

@app.route('/bin/<filename>')
def serve_file(filename):
    file_ext = filename.rsplit('.', 1)[1].lower()
    if file_ext == 'gif':
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, mimetype='image/gif')
    else:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'status': 'error', 'message': 'File too large'}), 413

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
