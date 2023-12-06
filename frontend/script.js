
var boards = null;
var selectedBoard = null;
var tables = null;


// Initialize list of all boards for current user
import('/frontend/request.js')
  .then(module => {
    const apiRequests = module.default;
    const userEmail = "grunet01@luther.edu" //change later to use oauth

    apiRequests.getBoardsByEmail(userEmail)
      .then(allBoards => {
        boards = allBoards;
        setCurrentBoard(allBoards[0].id);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

  })
  .catch(error => {
    console.error('Failed to load module:', error);
  });



function setCurrentBoard(boardId) {

  selectedBoard = boards.find(function (b) {
    return b.id == boardId
  });

  import('/frontend/request.js')
    .then(module => {

      const apiRequests = module.default;

      if (selectedBoard != null) {
        apiRequests.getTablesByBoardId(selectedBoard.id)
          .then(allTables => {

            tables = allTables;
            renderCurrentBoard();

          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }

    })
    .catch(error => {
      console.error('Failed to load module:', error);
    });

}


function renderCurrentBoard() {

  for (table of tables) {

    var entriesHtml = '';

    for (entry of table.entries) {

      entriesHtml += `
        <li class="list-group-item">
          <div class="w-90" ondblclick="editItem(${entry.id}, this)">${entry.text}</div>
          <span class="delete-item" onclick="deleteItem(${entry.id})">X</span>
        </li>`

    }

    const newTableHtml = `
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h2 contenteditable="true">${table.name}</h2>
          </div>
          <div class="card-body">
            <button class="btn btn-primary add">Add Element</button>
            <button class="btn btn-danger delete-table">Delete Table</button>
            <ul id="${table.id}" class="list-group">
              ${entriesHtml}
            </ul>
          </div>
        </div>
      </div>`;

    $('.row').append(newTableHtml);
    
    const newDrake = dragula([...document.getElementsByClassName('list-group')]);

    newDrake.on('drag', (el, source) => {
      el.classList.add('list-group-item', 'placeholder');
      if (el.innerText === '') {
        el.innerText = '';
      }
    });

    newDrake.on('dragend', (el) => {
      el.classList.remove('placeholder');
      if (el.innerText === '') {
        el.innerText = 'New Element...';
      }
    });

  }

  bindAddButton();
  bindDeleteTableButton();

}


function bindAddButton() {
  $('.add').off('click').on('click', function () {
    const listId = $(this).parent().find('ul').attr('id');
    const itemId = 'item' + listId + '.' + (lists[listId].length + 1);
    lists[listId].push(itemId);

    const newElement = $('<li class="list-group-item" data-placeholder="New Element..." onclick="editItem(this)"></li>');
    $('#' + listId).append(newElement);

    newElement.html('&nbsp;');
    newElement.append('<span class="delete-item" onclick="deleteItem(this)">X</span>');
  });
}

function bindDeleteTableButton() {
  $('.delete-table').off('click').on('click', function () {
    const tableId = $(this).parent().find('ul').attr('id');
    delete lists[tableId];
    $(this).parents('.col-md-4').remove();
  });
}

function deleteItem(el) {
  $(el).parent().remove();
}

function editItem(entryId, element) {
  const listItem = $(element).eq(0);
  const originalText = listItem.text().trim();

  listItem.attr('contenteditable', 'true');
  listItem.focus();

  listItem.off('blur').on('blur', function () {
    const trimmedText = $(this).text().trim();
    console.log(trimmedText);

    if (trimmedText === 'X') {
      listItem.remove();
    } else if (trimmedText === originalText && originalText === 'New Element...') {
      listItem.text('New Element...');
    }
  });
}

$(document).ready(() => {
  bindAddButton();

  const drake = dragula([document.getElementById('table1')]);

  drake.on('drag', (el, source) => {
    el.classList.add('list-group-item', 'placeholder');
    if (el.innerText === 'New Element...') {
      el.innerText = '';
    }
  });

  drake.on('dragend', (el) => {
    el.classList.remove('placeholder');
    if (el.innerText === '') {
      el.innerText = 'New Element...';
    }
  });

  $('#addTable').on('click', () => {
    const newTableHtml = '<div class="col-md-4"><div class="card"><div class="card-header"><h2 contenteditable="true">New Table</h2></div><div class="card-body"><button class="btn btn-primary add">Add Element</button><button class="btn btn-danger delete-table">Delete Table</button><ul id="' + newTableId + '" class="list-group"><li class="list-group-item" data-placeholder="New Element..." onclick="editItem(this)">&nbsp;<span class="delete-item" onclick="deleteItem(this)">X</span></li></ul></div></div></div>';
    $('.row').append(newTableHtml);
    
    const newDrake = dragula([...document.getElementsByClassName('list-group')]);

    newDrake.on('drag', (el, source) => {
      el.classList.add('list-group-item', 'placeholder');
      if (el.innerText === '') {
        el.innerText = '';
      }
    });

    newDrake.on('dragend', (el) => {
      el.classList.remove('placeholder');
      if (el.innerText === '') {
        el.innerText = 'New Element...';
      }
    });

    bindAddButton();
    bindDeleteTableButton();
  });
});
