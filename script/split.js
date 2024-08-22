// Global Variables
var selectedValuejsonData = {};
let memberName = document.getElementById('memberName');
let finalSplitDiv = document.getElementById('finalSplitDiv');
let membersDiv = document.getElementById('membersDiv');
let groupsDiv = document.getElementById('groupsDiv');
let selectedValue =''
var resultJson = {};




// Load JSON Data on Page Load
document.addEventListener('DOMContentLoaded', () => {
  const jsonUrl = 'Test/travel.json';
  fetch(jsonUrl)
    .then(response => response.json())
    .then(jsonData => {
      resultJson = jsonData;
      displayGroupsList(resultJson.groups);
    })
    .catch(error => {
      console.error('Error in loading JSON data:', error);
    });
});



// Add Group Function
document.getElementById('addGroupButton').addEventListener('click', addGroup);
function addGroup() {
  const newGroupId = resultJson.groups.length + 1;
  const newGroup = {
    "group_id": newGroupId,
    "group_name": `Group ${newGroupId}`,
    "members": []
  };

  resultJson.groups.push(newGroup);
  displayGroupsList(resultJson.groups);

  console.log("New group added:", newGroup);
  console.log("Updated resultJson:", resultJson);

}



// Display Group List
function displayGroupsList(groups) {
  const groupsListDiv = document.getElementById('groupsListDiv'); 
  groupsListDiv.innerHTML = '';
  groupsListDiv.style.height="280px"
  groupsListDiv.style.overflow="scroll"


  groups.forEach((group, index) => {
    let groupDiv = document.createElement('div');
    groupDiv.classList.add('group-div');
    // groupDiv.addEventListener('click', () => openGroupDetails(group.group_name));
    let jsonData = groups[index];
    let settlements = splitBill(jsonData);
    selectedValue = index; 

    groupDiv.addEventListener('click', () => {
        displayMembersDiv(jsonData); 
        displayFinalSplitDiv(settlements);
      });


  


    let deleteIcon = document.createElement('span');
    deleteIcon.textContent = '🗑️';
    deleteIcon.classList.add('delete-icon');
    deleteIcon.style.cursor = 'pointer';
    // deleteIcon.style.marginLeft = '800px';
    deleteIcon.style.float = 'right';


      deleteIcon.addEventListener('click', (event) => {
        event.stopPropagation(); 
        removeGroup(index); 
      });


    let groupName = document.createElement('p');
    groupName.textContent = group.group_name;
    groupName.classList.add('group-name');


    groupDiv.appendChild(groupName);
    groupDiv.appendChild(deleteIcon); 
    groupsListDiv.appendChild(groupDiv);
  });
}

// Remove Group Function
function removeGroup(index) {
  resultJson.groups.splice(index, 1); 
  displayGroupsList(resultJson.groups); 
}



function splitBill(jsonData) {
  console.log("json inside splitBill",jsonData)
  let balance = new Map();

  jsonData.members.forEach(member => {
    let totalExpense = 0;
  
    member.expenses.forEach(expense => {
      totalExpense += expense.amount;
    });
  
    balance.set(member.member_id, {
      name: member.member_name,
      balance: totalExpense
    });

  });
  
  console.log("balance before : ",balance)

  let totalExpenseSum = 0;
  balance.forEach(value => {
    totalExpenseSum += value.balance;
  });
  let avgExpense = totalExpenseSum / balance.size;
  console.log("balance.size is : ",balance.size)

  console.log("Average expence : ",avgExpense)

  balance.forEach((value, key) => {
    value.balance = avgExpense - value.balance;
  });
  
  let positive = [];
  let negative = [];
  
  balance.forEach((value, key) => {
    if (value.balance > 0) {
      positive.push({ id: key, name: value.name, balance: value.balance });
    } else if (value.balance < 0) {
      negative.push({ id: key, name: value.name, balance: -value.balance });
    }
  });

  positive.sort((a, b) => b.balance - a.balance);
  negative.sort((a, b) => b.balance - a.balance);
  
  
  
  let settlements = [];
  let i = 0, j = 0;
  
  while (i < negative.length && j < positive.length) {
    let debt = negative[i].balance;
    let credit = positive[j].balance;
    let amount = Math.min(debt, credit);
  
    settlements.push({
      from: negative[i].name,
      to: positive[j].name,
      amount: amount
    });
  
    negative[i].balance -= amount;
    positive[j].balance -= amount;
  
    if (negative[i].balance === 0) i++;
    if (positive[j].balance === 0) j++;
  }
  console.log("Settlements:", settlements);

  return settlements;


}



// Display Members in Selected Group
function displayMembersDiv(jsonData) {
  membersDiv.innerHTML = '';

  let groupHeadingDiv = document.createElement('div');
  groupHeadingDiv.classList.add('group-heading-div');

  let groupNameLabel = document.createElement('label');
  groupNameLabel.contentEditable = false;
  groupNameLabel.textContent = jsonData.group_name;
  groupNameLabel.classList.add('group-name-label');

  groupHeadingDiv.appendChild(groupNameLabel);
  membersDiv.appendChild(groupHeadingDiv);


  try {
    // Loop through existing members
    for (let i = 0; i < jsonData.members.length; i++) {
      createMemberDiv(jsonData.members[i]);
    }


    // Add Member button
    let addMemberButton = document.createElement('button');
    addMemberButton.textContent = 'Add Member';
    addMemberButton.onclick = function () {
      let newMember = {
        member_name: '',
        member_id: Date.now(),
        expenses: []
      };
      jsonData.members.push(newMember);
      createMemberDiv(newMember);
    };
    membersDiv.appendChild(addMemberButton);

      // Add Save Changes button
      let saveButton = document.createElement('button');
      saveButton.textContent = 'Save Changes';
      saveButton.onclick = function () {
          saveChanges(jsonData);
          jsonData.group_name = groupNameLabel.textContent;

      };
      membersDiv.appendChild(saveButton);

  } catch (error) {
    finalSplitDiv.innerHTML = '';
  }
}




function createMemberDiv(memberData) {
  let memberDiv = document.createElement('div');
  memberDiv.classList.add('member-div');

  let namesInput = document.createElement('input');
  namesInput.type = 'text';
  namesInput.value = `${memberData.member_name}`;
  namesInput.style.fontSize = '30px';
  namesInput.style.textTransform = 'capitalize';
  namesInput.classList.add('namesInputClass');

  let namesId = document.createElement('input');
  namesId.type = 'text';
  namesId.value = `ID : ${memberData.member_id}`;
  namesId.classList.add('idClass');
  namesId.style.fontSize = '15px';
  namesId.readOnly = true;

  memberDiv.appendChild(namesInput);
  memberDiv.appendChild(namesId);

  // Loop through expenses
  for (let j = 0; j < memberData.expenses.length; j++) {
    createExpenseDiv(memberDiv, memberData.expenses[j]);
  }

  // Add "Add Expense" button
  let addExpenseButton = document.createElement('button');
  addExpenseButton.textContent = 'Add Expense';
  addExpenseButton.onclick = function () {
    createExpenseDiv(memberDiv, { expense_name: '', amount: 0 });
  };
  memberDiv.appendChild(addExpenseButton);

  // Add "Remove Member" button
  let removeMemberButton = document.createElement('button');
  removeMemberButton.textContent = 'Remove Member';
  removeMemberButton.onclick = function () {
    membersDiv.removeChild(memberDiv);
  };
  memberDiv.appendChild(removeMemberButton);

  membersDiv.appendChild(memberDiv);
}

function createExpenseDiv(memberDiv, expenseData) {
  let expenseItemDiv = document.createElement('div');
  expenseItemDiv.classList.add('expense-item');

  let expenseNameLabel = document.createElement('label');
  expenseNameLabel.textContent = 'Expense Name:';
  expenseNameLabel.classList.add('expense-name-label');

  let expensesNameInput = document.createElement('input');
  expensesNameInput.type = 'text';
  expensesNameInput.value = `${expenseData.expense_name}`;
  expensesNameInput.classList.add('expense-name');

  let expenseAmountLabel = document.createElement('label');
  expenseAmountLabel.textContent = 'Amount:';
  expenseAmountLabel.classList.add('expense-amount-label');

  let expensesAmountInput = document.createElement('input');
  expensesAmountInput.type = 'number';
  expensesAmountInput.min = '0';

  expensesAmountInput.value = `${expenseData.amount}`;
  expensesAmountInput.classList.add('expense-amount');

  let removeExpenseButton = document.createElement('button');
  removeExpenseButton.textContent = 'Remove Expense';
  removeExpenseButton.onclick = function () {
    memberDiv.removeChild(expenseItemDiv);
  };

  expenseItemDiv.appendChild(expenseNameLabel);
  expenseItemDiv.appendChild(expensesNameInput);
  expenseItemDiv.appendChild(expenseAmountLabel);
  expenseItemDiv.appendChild(expensesAmountInput);
  expenseItemDiv.appendChild(removeExpenseButton);

  memberDiv.appendChild(expenseItemDiv);
}




function saveChanges(jsonData) {
  let memberDivs = document.querySelectorAll('.member-div');
  jsonData.members = [];


  memberDivs.forEach((memberDiv, i) => {
      let memberName = memberDiv.querySelector('.namesInputClass').value;

      let memberId;
      if (resultJson.groups[selectedValue].members[i] && resultJson.groups[selectedValue].members[i].member_id) {
          memberId = resultJson.groups[selectedValue].members[i].member_id;
      } else {
          memberId = 'UID_' + (i + 1);
      }


      let expenses = [];
      let expenseItems = memberDiv.querySelectorAll('.expense-item');

      expenseItems.forEach(expenseItem => {
          let expenseName = expenseItem.querySelector('.expense-name').value;
          let expenseAmount = parseFloat(expenseItem.querySelector('.expense-amount').value);
          if (expenseName && !isNaN(expenseAmount)) {
              expenses.push({
                  expense_name: expenseName,
                  amount: expenseAmount
              });
          }
      });
 
      jsonData.members.push({
          member_id: memberId,
          member_name: memberName,
          expenses: expenses
      });
  });




  console.log("Updated JSON Data:", jsonData);
  displayGroupsList(resultJson.groups);

  displayMembersDiv(jsonData);
  let settlements = splitBill(jsonData);
  displayFinalSplitDiv(settlements);
  
}





function displayFinalSplitDiv(settlements) {
  finalSplitDiv.innerHTML = ''; 

  
  if(settlements.length==0){
    let input = document.createElement('input');
    input.type = 'text';
    input.readOnly = true;
    input.value = `No Settlement needed`;
    finalSplitDiv.appendChild(input);

  }
  
  settlements.forEach(settlement => {
  let input = document.createElement('input');
  input.type = 'text';
  input.readOnly = true;
  input.value = `${settlement.to} need to pays ${settlement.from} ${settlement.amount.toFixed(2)} $`;

  finalSplitDiv.appendChild(input);
  });
}







document.getElementById('submit').onclick = function() {

  if (selectedValue === null || selectedValue === undefined) {
    console.log("No group selected.");
    return;
}

  let members = [];
  let memberDivs = membersDiv.getElementsByClassName('member-div');
  
  for (let i = 0; i < memberDivs.length; i++) {
      let memberDiv = memberDivs[i];
      let memberName = memberDiv.querySelector('input[type="text"]').value;

      let expenses = [];
      let expenseNames = memberDiv.getElementsByClassName('expense-name');
      let expenseAmounts = memberDiv.getElementsByClassName('expense-amount');

      for (let j = 0; j < expenseNames.length; j++) {
          let expenseName = expenseNames[j].value;
          let expenseAmount = parseFloat(expenseAmounts[j].value);

          expenses.push({
              expense_name: expenseName,
              amount: expenseAmount
          });
      }

        let memberId;
        if (resultJson.groups[selectedValue].members[i] && resultJson.groups[selectedValue].members[i].member_id) {
            memberId = resultJson.groups[selectedValue].members[i].member_id;
        } else {
            memberId = 'UID_' + (i + 1);

        }
  
        members.push({
            member_id: memberId,
            member_name: memberName,
            expenses: expenses
        });


  }

  try{
    resultJson.groups[selectedValue].members = members;
    let settlements = splitBill(resultJson.groups[selectedValue]);
    displayFinalSplitDiv(settlements);
  
    console.log("Value send in splitBill",resultJson.groups[selectedValue]);
    console.log("New DATA after changes :", resultJson);

  }catch(error){

  }


};
