from flask import Flask, jsonify, request
from flask_cors import CORS


from database.db_manager import *

app = Flask(__name__)
CORS(app)


initialize_database()
clear_database()
insert_test_data()
view_data()


# Helper functions
def board_to_dict(board): return {'id': board.id, 'name': board.name, 'emails': board.emails}
def table_to_dict(table): return {'id': table.id, 'name': table.name}
def entry_to_dict(entry): return {'id': entry.id, 'text': entry.text}


# GET endpoints
@app.route('/boards/<string:user_email>', methods=['GET'])
def boards(user_email):
    print(user_email)
    boards = get_boards_by_email(user_email)

    if not boards:
        return jsonify({'error': 'No boards found'}), 404

    board_list = [board_to_dict(board) for board in boards]

    response = jsonify(board_list)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/boards/<int:board_id>/tables', methods=['GET'])
def tables(board_id):
    tables = get_tables(board_id)

    response = jsonify(tables)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


# POST endpoints
@app.route('/boards', methods=['POST', 'PUT'])
def upsert_board_endpoint():
    name = request.json.get('name')
    board_id = request.json.get('board_id')  # For updates

    upsert_board(name, board_id)

    response = jsonify({'message': 'Board upserted successfully'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/tables', methods=['POST', 'PUT'])
def upsert_table_endpoint():
    board_id = request.json.get('board_id')
    name = request.json.get('name')
    table_id = request.json.get('table_id')  # For updates

    newTable = upsert_table(board_id, name, table_id)

    response = jsonify(table_to_dict(newTable))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/entries', methods=['POST', 'PUT'])
def upsert_entry_endpoint():
    table_id = request.json.get('table_id')
    text = request.json.get('text')
    entry_id = request.json.get('entry_id')  # For updates

    newEntry = upsert_entry(table_id, text, entry_id)

    response = jsonify(entry_to_dict(newEntry))
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/entries/<int:entry_id>/move', methods=['PUT'])
def move_entry_to_table_endpoint(entry_id):
    new_table_id = request.json.get('new_table_id')

    update_entry_table(entry_id, new_table_id)

    response = jsonify({'message': 'Entry moved to new table successfully'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


# DELETE Endpoints
@app.route('/boards/<int:board_id>', methods=['DELETE'])
def delete_board(board_id):
    remove_board(board_id)

    response = jsonify({'message': 'Board removed successfully'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/tables/<int:table_id>', methods=['DELETE'])
def delete_table(table_id):
    remove_table(table_id)

    response = jsonify({'message': 'Table removed successfully'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/entries/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    remove_entry(entry_id)

    response = jsonify({'message': 'Entry removed successfully'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run(debug=True)
