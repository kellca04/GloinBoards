from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from database.db_config import *



def insert_test_data():
    Session = sessionmaker(bind=engine)
    session = Session()

    # Creating a single board
    board_main = Board(name='Main Board')

    # Tables for 'Main Board'
    table_todo = Table(name='To-Do', board=board_main)
    table_in_progress = Table(name='In Progress', board=board_main)
    table_in_review = Table(name='In Review', board=board_main)
    table_completed = Table(name='Completed', board=board_main)

    # Entries for 'To-Do' table
    entry_todo1 = Entry(text='Finish project proposal', table=table_todo)
    entry_todo2 = Entry(text='Call client for meeting', table=table_todo)
    entry_todo3 = Entry(text='Prepare presentation slides', table=table_todo)
    entry_todo4 = Entry(text='Follow up on emails', table=table_todo)

    # Entries for 'In Progress' table
    entry_in_progress1 = Entry(text='Develop feature A', table=table_in_progress)
    entry_in_progress2 = Entry(text='Code optimization', table=table_in_progress)
    entry_in_progress3 = Entry(text='Refactor existing code', table=table_in_progress)

    # Entries for 'In Review' table
    entry_in_review1 = Entry(text='Document code changes', table=table_in_review)
    entry_in_review2 = Entry(text='Bug fixing', table=table_in_review)
    entry_in_review3 = Entry(text='Code review', table=table_in_review)

    # Entries for 'Completed' table
    entry_completed1 = Entry(text='Project A completed', table=table_completed)
    entry_completed2 = Entry(text='Task B done', table=table_completed)
    entry_completed3 = Entry(text='Final testing and QA', table=table_completed)
    entry_completed4 = Entry(text='Prepare final report', table=table_completed)

    # Adding data to the session
    session.add_all([
        board_main, table_todo, table_in_progress, table_in_review, table_completed,
        entry_todo1, entry_todo2, entry_todo3, entry_todo4,
        entry_in_progress1, entry_in_progress2, entry_in_progress3,
        entry_in_review1, entry_in_review2, entry_in_review3,
        entry_completed1, entry_completed2, entry_completed3, entry_completed4
    ])
    session.commit()


def view_data():
    Session = sessionmaker(bind=engine)
    session = Session()

    # Query and print data from the tables
    print("Boards:")
    for board in session.query(Board).all():
        print(f"Board ID: {board.id}, Name: {board.name}")
        print("Tables:")
        for table in board.tables:
            print(f"  Table ID: {table.id}, Name: {table.name}")
            print("  Entries:")
            for entry in table.entries:
                print(f"    Entry ID: {entry.id}, Text: {entry.text}")
    print("\n")


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
def get_boards():
    Session = sessionmaker(bind=engine)
    session = Session()

    boards = session.query(Board).all()
    session.close()

    return boards

def get_tables(board_id):
    Session = sessionmaker(bind=engine)
    session = Session()

    tables = session.query(Table).filter_by(board_id=board_id).all()
    session.close()

    return tables

def get_entries(table_id):
    Session = sessionmaker(bind=engine)
    session = Session()

    entries = session.query(Entry).filter_by(table_id=table_id).all()
    session.close()
    
    return entries

