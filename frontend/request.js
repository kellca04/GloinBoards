const BASE_URL = 
  'https://cs330-final.onrender.com'; // online api
  //'http://127.0.0.1:5000';          // for local hosting

const apiRequests = {
  async upsertBoard(name, boardId = null, email = null) {
    const url = `${BASE_URL}/boards`;
    const method = boardId ? 'PUT' : 'POST';
    const body = JSON.stringify({ name, board_id: boardId, email: email });

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    
    return await response.json();
  },

  async upsertTable(name, boardId, tableId = null) {
    const url = `${BASE_URL}/tables`;
    const method = tableId ? 'PUT' : 'POST';
    const body = JSON.stringify({ board_id: boardId, name, table_id: tableId });

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    
    return await response.json();
  },

  async upsertEntry(text, tableId, entryId = null) {
    const url = `${BASE_URL}/entries`;
    const method = entryId ? 'PUT' : 'POST';
    const body = JSON.stringify({ table_id: tableId, text, entry_id: entryId });

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    
    return await response.json();
  },

  async moveEntryToTable(entryId, newTableId, position) {
    const url = `${BASE_URL}/entries/${entryId}/move`;
    const method = 'PUT';
    const body = JSON.stringify({ new_table_id: newTableId, position: position});

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    
    return await response.json();
  },

  async getBoardsByEmail() {
    const userEmail = sessionStorage.getItem('userEmail') ?? "grunet01@luther.edu";
    if (!userEmail) {
      throw new Error('User email not found in sessionStorage');
    }
    const url = `${BASE_URL}/boards/${userEmail}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching boards. Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error in getBoardsByEmail:', error.message);
      throw error; 
    }
  },

  async getTablesByBoardId(boardId) {
    const url = `${BASE_URL}/boards/${boardId}/tables`;
    const response = await fetch(url);
    return await response.json();
  },

  async getEntriesByTableId(tableId) {
    const url = `${BASE_URL}/tables/${tableId}/entries`;
    const response = await fetch(url);
    return await response.json();
  },

  async deleteBoard(boardId) {
    const url = `${BASE_URL}/boards/${boardId}`;
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await fetch(url, requestOptions);
    if (response.ok) {
      return { message: 'Board removed successfully' };
    } else {
      throw new Error('Failed to remove board');
    }
  },

  async deleteTable(tableId) {
    const url = `${BASE_URL}/tables/${tableId}`;
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await fetch(url, requestOptions);
    if (response.ok) {
      return { message: 'Table removed successfully' };
    } else {
      throw new Error('Failed to remove table');
    }
  },

  async deleteEntry(entryId) {
    const url = `${BASE_URL}/entries/${entryId}`;
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await fetch(url, requestOptions);
    if (response.ok) {
      return { message: 'Entry removed successfully' };
    } else {
      throw new Error('Failed to remove entry');
    }
  }
};

export default apiRequests;
