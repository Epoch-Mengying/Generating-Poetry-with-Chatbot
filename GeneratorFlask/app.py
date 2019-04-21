#!flask/bin/python
from flask import Flask, jsonify
from flask import abort
from flask import make_response
from flask import request
from generate import Generator
from plan import Planner


## example of post request #####
##curl -i -H "Content-Type: application/json" -X POST -d '{"inputString":"千年", "queryType":"Image"}' http://localhost:5000/todo/api/v1.0/tasks

## initiate flask app
app = Flask(__name__)
def init():
    global planner,generator2
    # load the pre-trained Keras model
    planner = Planner()
    generator2 = Generator()
    #print(generator2.getSession())



@app.route('/todo/api/v1.0/tasks', methods=['POST'])
def create_task():
    if not request.json or (not 'inputString' or not 'queryType') in request.json:
        abort(400)
    #print(generator2.getSession())

    keywords = planner.plan(request.json['inputString'])
    #generator2 = Generator()
    poem = generator2.generate(keywords)
    
    print("Keywords: " + ' '.join(keywords))
    for sentence in poem:
        print(sentence)

    task = {
        'queryType': request.json['queryType'],
        'inputString': request.json['inputString'],
        'keywords': keywords,
        'poem':poem,
        'description': request.json.get('description', "")
    }

    return jsonify({'task': task}), 200



@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

if __name__ == '__main__':
    ## initiate poem's planner and generator.
    init()
    app.run(threaded=True)