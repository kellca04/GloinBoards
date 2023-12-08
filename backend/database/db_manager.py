from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, joinedload

from database.db_config import *


Session = sessionmaker(bind=engine)


def insert_test_data():
    Session = sessionmaker(bind=engine)
    session = Session()

    print("Adding default data...")

    # Creating a single board
    board_main = Board(name='Main Board (Global)', emails=[])

    # Tables for 'Main Board'
    site_features = Table(name='Site Features', board=board_main, order=[])
    table_features = Table(name='Table Features', board=board_main, order=[])
    upcoming_features = Table(name='Upcoming Features', board=board_main, order=[])

    # Adding data to the session
    session.add_all([
        board_main, site_features, table_features, upcoming_features
    ])

    session.commit()

    session.refresh(site_features)
    upsert_entry(site_features.id, "Site Global Live Chat")
    upsert_entry(site_features.id, "Create New Private Boards")
    upsert_entry(site_features.id, "Add Other Users By Email Address to Private Boards")
    upsert_entry(site_features.id, "Google Authentication")
    upsert_entry(site_features.id, "Access to Private Boards Associated with Your Account")

    session.refresh(table_features)
    upsert_entry(table_features.id, "Add/Remove Tables")
    upsert_entry(table_features.id, "Rename Tables (double click on title)")
    upsert_entry(table_features.id, "Rename Tasks (double click)")
    upsert_entry(table_features.id, "Drag Tasks Between Tables")
    upsert_entry(table_features.id, "Add And Remove Tasks")

    session.refresh(upcoming_features)
    upsert_entry(upcoming_features.id, "Delete Boards")
    upsert_entry(upcoming_features.id, "Global And Board-Specific Live Chats")


    session.commit()
    session.close()

    view_data()


def view_data():
    Session = sessionmaker(bind=engine)
    session = Session()

    # Query and print data from the tables
    print("Boards:")
    for board in session.query(Board).all():
        print(f"Board ID: {board.id}, Name: {board.name}, Emails: {board.emails}")
        print("Tables:")
        for table in board.tables:
            print(f"  Table ID: {table.id}, Name: {table.name}")
            print("  Entries:")
            for entry in table.entries:
                print(f"    Entry ID: {entry.id}, Text: {entry.text}")
    print("\n")
    session.close()


def clear_database():
    Session = sessionmaker(bind=engine)
    session = Session()

    # Get all tables from metadata
    metadata = Base.metadata
    tables = metadata.sorted_tables

    # Delete all records from tables
    for table in reversed(tables):
        session.execute(table.delete())
    session.commit()


# Define functions for retrieving data
def get_boards_by_email(email):
    Session = sessionmaker(bind=engine)
    session = Session()

    boards = session.query(Board).filter(Board.emails.contains([email])).all()
    global_boards = session.query(Board).filter("(Global)" in Board.name).all()

    for board in global_boards:
        boards.append(board)

    session.close()

    return boards


def get_tables(board_id):
    Session = sessionmaker(bind=engine)
    session = Session()

    tables = session.query(Table).options(joinedload(Table.entries)).filter_by(board_id=board_id).all()

    tables_with_entries = []
    for table in tables:
        table_data = {
            'id': table.id,
            'name': table.name,
            'entries': [{'id': entry.id, 'text': entry.text} for entry in table.entries],
            'order': table.order
        }
        tables_with_entries.append(table_data)

    session.close()
    return tables_with_entries


def get_entries(table_id):
    Session = sessionmaker(bind=engine)
    session = Session()

    entries = session.query(Entry).filter_by(table_id=table_id).all()
    session.close()
    
    return entries


# Define functions for modifying data
def upsert_board(name, board_id=None, user_email=None):
    session = Session()
    if board_id:
        board = session.query(Board).filter_by(id=board_id).first()
        if board:
            board.name = name
    else:
        new_board = Board(name=name, emails=[user_email])
        session.add(new_board)
    session.commit()
    session.close()


def add_board_user(board_id, email):
    session = Session()
    board = session.query(Board).filter_by(id=board_id).first()

    previousEmails = board.emails

    board.emails = None
    session.commit()
    session.refresh(board)

    previousEmails.append(email)
    board.emails = previousEmails

    session.commit()
    session.close()



def upsert_table(board_id, name, table_id=None):
    session = Session()
    
    table = None
    if table_id:
        table = session.query(Table).filter_by(id=table_id).first()
        if table:
            table.name = name
    else:
        board = session.query(Board).filter_by(id=board_id).first()
    
        if not board:
            session.close()
            return None
        
        new_table = Table(name=name, board=board, order=[])
        session.add(new_table)
        table = new_table
    
    session.commit()

    if table:
        session.refresh(table)
    
    session.close()
    return table



def upsert_entry(table_id, text, entry_id=None):
    session = Session()
    
    entry = None
    if entry_id:
        entry = session.query(Entry).filter_by(id=entry_id).first()
        if entry:
            entry.text = text

    else:
        table = session.query(Table).filter_by(id=table_id).first()

        if not table:
            session.close()
            return None
        
        entry = Entry(text=text, table=table)
        session.add(entry)

        session.commit()

        session.refresh(entry)
        new_order = table.order

        table.order = None
        session.commit()
        session.refresh(table)

        new_order.append(entry.id)
        table.order = new_order
        

    response = {'id': entry.id, 'text': entry.text}
    
    session.commit()
    session.close()

    return response


def update_entry_table(entry_id, new_table_id, position):
    session = Session()
    entry = session.query(Entry).filter_by(id=entry_id).first()
    old_table = session.query(Table).filter_by(id=entry.table_id).first()
    new_table = session.query(Table).filter_by(id=new_table_id).first()

    removed_entry_order = []

    for e in old_table.order:
        if (e != entry_id):
            removed_entry_order.append(e)

    old_table.order = None

    session.commit()
    session.refresh(old_table)

    old_table.order = removed_entry_order

    inserted_entry_order = new_table.order[:position]
    inserted_entry_order.append(entry_id)
    inserted_entry_order.extend(new_table.order[position:])

    new_table.order = None
    session.commit()

    session.refresh(new_table)
    new_table.order = inserted_entry_order

    if entry and new_table:
        entry.table_id = new_table_id
        
    session.commit()
    
    session.close()


# Define functions for removing data
def remove_board(board_id):
    session = Session()
    board = session.query(Board).filter_by(id=board_id).first()

    if board:
        session.delete(board)
        session.commit()

    session.close()

def remove_table(table_id):
    session = Session()
    table = session.query(Table).filter_by(id=table_id).first()

    if table:
        session.delete(table)
        session.commit()

    session.close()

def remove_entry(entry_id):
    session = Session()
    entry = session.query(Entry).filter_by(id=entry_id).first()

    if entry:
        old_table = session.query(Table).filter_by(id=entry.table_id).first()

        removed_entry_order = []

        for e in old_table.order:
            if (e != entry_id):
                removed_entry_order.append(e)

        old_table.order = None

        session.commit()
        session.refresh(old_table)

        old_table.order = removed_entry_order
        session.delete(entry)
        session.commit()

    session.close()