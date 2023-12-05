

const lists = {
  'table1': [],
};
  
$(document).ready(() => {
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

  bindAddButton();

  for (let listId in lists) {
    lists[listId].forEach((item) => {
      $('#' + listId).append('<li class="list-group-item" data-placeholder="' + item + '" onclick="editItem(this)">' + item + '<span class="delete-item" onclick="deleteItem(this)">X</span></li>');
    });
  }

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
    const newTableId = 'table' + ($('.list-group').length + 1);
    $('.row').append('<div class="col-md-4"><div class="card"><div class="card-header"><h2 contenteditable="true">New Table</h2></div><div class="card-body"><button class="btn btn-primary add">Add Element</button><button class="btn btn-danger delete-table">Delete Table</button><ul id="' + newTableId + '" class="list-group"><li class="list-group-item" data-placeholder="New Element..." onclick="editItem(this)">&nbsp;<span class="delete-item" onclick="deleteItem(this)">X</span></li></ul></div></div></div>');
    lists[newTableId] = [];
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

function deleteItem(el) {
  $(el).parent().remove();
}

function editItem(el) {
  const listItem = $(el);
  const originalText = listItem.text().trim();

  listItem.attr('contenteditable', 'true');
  listItem.focus();

  listItem.off('blur').on('blur', function () {
    const trimmedText = $(this).text().trim();

    if (trimmedText === '') {
      listItem.remove();
    } else if (trimmedText === originalText && originalText === 'New Element...') {
      listItem.text('New Element...');
    }
  });
}
