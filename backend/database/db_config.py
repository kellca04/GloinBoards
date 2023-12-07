from sqlalchemy import JSON, URL, create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sqlalchemy.dialects.postgresql import ARRAY


# For local use with sqlite
#db_url = "sqlite:///database/model.db"
#engine = create_engine(db_url, echo=False)


#db_url = f"postgresql+psycopg2://{username}:{password}@{host}/{dbname}"
db_url = "postgresql+psycopg2://final_project_database_h5fm_user:qQifzG040u147jy0b2Kl35KCYl2yFndu@dpg-cloj7u9oh6hc73bhqod0-a/final_project_database_h5fm"
engine = create_engine(db_url, echo=False)


# Create a base class for declarative class definitions
Base = declarative_base()


# Define the Entry class inheriting from Base
class Entry(Base):
    __tablename__ = 'Entry'

    id = Column(Integer, primary_key=True)
    text = Column(String)
    table_id = Column(Integer, ForeignKey('Table.id'))  # Foreign key relationship
    table = relationship('Table', back_populates='entries')  # Bidirectional relationship


# Define the Table class inheriting from Base
class Table(Base):
    __tablename__ = 'Table'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    board_id = Column(Integer, ForeignKey('Board.id'))  # Foreign key relationship
    board = relationship('Board', back_populates='tables')  # Bidirectional relationship
    entries = relationship('Entry', back_populates='table', lazy='joined')  # Bidirectional relationship
    order = Column(ARRAY(Integer))  


# Define the Board class inheriting from Base
class Board(Base):
    __tablename__ = 'Board'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    emails = Column(ARRAY(String))
    tables = relationship('Table', back_populates='board')  # One-to-many relationship



def initialize_database():
    # Create the tables in the database
    Base.metadata.create_all(engine)

