from sqlalchemy import JSON, create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base


db_url = "sqlite:///database/model.db"
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
    entries = relationship('Entry', back_populates='table')  # Bidirectional relationship


# Define the Board class inheriting from Base
class Board(Base):
    __tablename__ = 'Board'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    emails = Column(JSON)
    tables = relationship('Table', back_populates='board')  # One-to-many relationship



def initialize_database():
    # Create the tables in the database
    Base.metadata.create_all(engine)

