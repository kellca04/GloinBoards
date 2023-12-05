from flask import Flask, jsonify, request

from database.db_manager import *

app = Flask(__name__)


#initialize_database()
#clear_database()
#insert_test_data()
view_data()


# Helper functions
def board_to_dict(board): return {'id': board.id, 'name': board.name, 'emails': board.emails}

def table_to_dict(table): return {'id': table.id, 'name': table.name}

def entry_to_dict(entry): return {'id': entry.id, 'text': entry.text, 'table_id': entry.table_id}


# GET endpoints
@app.route('/boards/<string:user_email>', methods=['GET'])
def boards(user_email):
    boards = get_boards_by_email(user_email)

    if not boards:
        return jsonify({'error': 'No boards found'}), 404

    board_list = [board_to_dict(board) for board in boards]

    return jsonify({'boards': board_list})


@app.route('/boards/<int:board_id>/tables', methods=['GET'])
def tables(board_id):
    tables = get_tables(board_id)

    if not tables:
        return jsonify({'error': 'No tables found for the given board ID'}), 404

    table_list = [table_to_dict(table) for table in tables]

    return jsonify({'tables': table_list})


@app.route('/tables/<int:table_id>/entries', methods=['GET'])
def entries(table_id):
    entries = get_entries(table_id)

    if not entries:
        return jsonify({'error': 'No entries found for the given table ID'}), 404

    entry_list = [entry_to_dict(entry) for entry in entries]

    return jsonify({'entries': entry_list})



# POST endpoints
@app.route('/boards', methods=['POST'])
def upsert_board_endpoint():
    name = request.json.get('name')
    board_id = request.json.get('board_id')  # For updates

    upsert_board(name, board_id)
    return jsonify({'message': 'Board upserted successfully'})


@app.route('/tables', methods=['POST'])
def upsert_table_endpoint():
    board_id = request.json.get('board_id')
    name = request.json.get('name')
    table_id = request.json.get('table_id')  # For updates

    upsert_table(board_id, name, table_id)
    return jsonify({'message': 'Table upserted successfully'})


@app.route('/entries', methods=['POST'])
def upsert_entry_endpoint():
    table_id = request.json.get('table_id')
    text = request.json.get('text')
    entry_id = request.json.get('entry_id')  # For updates

    upsert_entry(table_id, text, entry_id)
    return jsonify({'message': 'Entry upserted successfully'})


@app.route('/entries/<int:entry_id>/move', methods=['PUT'])
def move_entry_to_table_endpoint(entry_id):
    new_table_id = request.json.get('new_table_id')

    change_entry_table(entry_id, new_table_id)
    return jsonify({'message': 'Entry moved to new table successfully'})


if __name__ == "__main__":
    app.run(debug=True)
