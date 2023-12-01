from flask import Flask, jsonify

from database.db_manager import *

app = Flask(__name__)


def board_to_dict(board): return {'id': board.id, 'name': board.name}

def table_to_dict(table): return {'id': table.id, 'name': table.name}

def entry_to_dict(entry): return {'id': entry.id, 'text': entry.text, 'table_id': entry.table_id}


@app.route('/boards')
def boards():
    boards = get_boards()

    if not boards:
        return jsonify({'error': 'No boards found'}), 404

    board_list = [board_to_dict(board) for board in boards]

    return jsonify({'boards': board_list})


@app.route('/boards/<int:board_id>/tables')
def tables(board_id):
    tables = get_tables(board_id)

    if not tables:
        return jsonify({'error': 'No tables found for the given board ID'}), 404

    table_list = [table_to_dict(table) for table in tables]

    return jsonify({'tables': table_list})


@app.route('/tables/<int:table_id>/entries')
def entries(table_id):
    entries = get_entries(table_id)

    if not entries:
        return jsonify({'error': 'No entries found for the given table ID'}), 404

    entry_list = [entry_to_dict(entry) for entry in entries]

    return jsonify({'entries': entry_list})


if __name__ == "__main__":
    app.run(debug=True)
