#!/usr/bin/python3

import flask;
import os

app = flask.Flask(__name__)

@app.route('/charsheet/')
def charsheet():
    return flask.render_template('charsheet.html')

if __name__ == '__main__':
    app.run(debug=True)
