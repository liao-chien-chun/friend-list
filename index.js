const Base_URL = "https://lighthouse-user-api.herokuapp.com";
const index_URL = Base_URL + "/api/v1/users/";
const container = document.querySelector("#user-list"); //放使用者清單的容器節點

const User = []; //把使用者迭代進來
//200

//一頁要21個人
const Person_Per_Page = 21

//改放全域
let filterPerson = []

//抓到分頁器ul節點
const Paginator = document.querySelector('.pagination')

//把serach-form節點抓出來
const searchForm = document.querySelector('#search-form')

//input節點
const searchInput = document.querySelector('#search-input')


//函式渲染分頁器
function renderPaginator(amount) {
  //Math.ceil無條件進位
  //找出總共幾頁
  const totalPage = Math.ceil(amount / Person_Per_Page)

  let rawhtml = ''
  for (let page = 1; page <= totalPage; page++) {
    rawhtml += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  Paginator.innerHTML = rawhtml
}

//函式取得該分頁的個人資料 依照分頁取得資料內容
function getPersonByPage(page) {
  // page1 User: 0 - 21
  // page2 21 - 42
  // page3 42 - 63
  //用slice

  //用三元運算子 如果filterPerson有長度就用它沒有長度代表找不到就渲染原本的使用者
  const data = filterPerson.length ? filterPerson : User

  const startIndex = (page - 1) * Person_Per_Page
  return data.slice(startIndex, startIndex + Person_Per_Page)
}

//函式加入最愛
function addToFavorite(id) {
  //我的最愛清單 回傳給我沒有的話給我空陣列
  const list = JSON.parse(localStorage.getItem('Favorite')) || []

  const Person = User.find(person => person.id === id)

  //避免重複加入
  if (list.some(person => person.id === id)) {
    return alert('此人已經加入最愛')
  }

  list.push(Person)
  // console.log(list)//測試

  localStorage.setItem('Favorite', JSON.stringify(list))
}


//創造使用者清單
function renderUserList(data) {
  let userHTML = "";

  data.forEach((item) => {
    // console.log(item)
    //需要avatat, name, surname, id ,要使用dataset 來讓她擁有id 然後不管是照片還是h5還是空白的div部分都要有
    //這樣我們不管點到哪個都可以找裡面找到id
    userHTML += `
      <div class="card m-2">
        <img src="${item.avatar}" class="card-img-top" alt="card-image" data-id="${item.id}">
        <div class="card-body" data-id="${item.id}">
          <h5 class="card-title" data-id="${item.id}">${item.name} ${item.surname}</h5>
        </div>
        <div class="card-footer text-muted">
          <button
            class="btn btn-primary btn-show-person"
            data-bs-toggle="modal"
            data-bs-target="#user-modal"
            data-id="${item.id}"
          >
          More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}" id>+</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = userHTML;
}

function showUserModal(id) {
  //把modal需要用到的節點選出來
  const modalTitle = document.querySelector(".modal-title");
  const modalAvatar = document.querySelector(".modal-avatar");
  const modalUserInfo = document.querySelector(".user-info-data");

  axios
    .get(index_URL + id) //取得個別id的使用者資料ＡＰＩ
    .then((response) => {
      const user = response.data;
      // console.log(user); //檢查是否正確
      modalTitle.innerText = user.name + " " + user.surname;
      modalAvatar.src = user.avatar;

      //把資料更新近modal裡面
      modalUserInfo.innerHTML = `
        <P>email: ${user.email}</p>
        <P>gender: ${user.gender}</p>
        <P>age: ${user.age}</p>
        <P>region: ${user.region}</p>
        <P>birthday: ${user.birthday}</p>
      `;
    })
    .catch((error) => {
      console.log(error);
    });
}

//給container掛上監聽器
container.addEventListener("click", function onPersonClick(event) {
  let target = event.target;
  // console.log(target) //測試

  //如果點擊到的class含有這個
  if (target.matches('.btn-show-person')) {
    showUserModal(Number(target.dataset.id))//dataset.id取出來的是字串要轉成數字才能用
  } else if (target.matches('.btn-add-favorite')) {
    // console.log(target) //測試
    addToFavorite(Number(target.dataset.id))
  }
  


  // console.log(Number(target.dataset.id)) //601
  // console.log(typeof Number(target.dataset.id)) //number
});

axios
  .get(index_URL)
  .then((response) => {
    User.push(...response.data.results); //運用展開運算子迭代出所有資料，把他放進前面設好的空陣列裡面
    // console.log(User)
    renderPaginator(User.length)
    renderUserList(getPersonByPage(1)); //把所有使用者渲染出來
  })
  .catch((error) => {
    console.log(error);
  });


//search掛上監聽器
searchForm.addEventListener('submit', function onSearchFormSumbit(event) {
  //預防預設送出重整網頁
  event.preventDefault()
  // console.log('click') 測試

  //取得輸入的值排除空白跟統一變成小寫
  const inputValue = searchInput.value.trim().toLowerCase()
  // console.log(inputValue) //測試

  // let filterPerson = []

  //找到符合輸入資料的人
  filterPerson = User.filter((person) => (person.name + person.surname).toLowerCase().includes(inputValue))

  //如果沒有找到符合條件的儲存符合條件的 會是空的
  if (filterPerson.length === 0) {
    return alert(`請輸入正確的關鍵字: ${inputValue}`)
  }
  
  //重新渲染頁面渲染出搜尋的人
  renderPaginator(filterPerson.length)
  renderUserList(getPersonByPage(1))
})

//分頁監聽器 點擊換頁
Paginator.addEventListener('click', function onPaginatorclick(event) {
  //點擊到的不是Ａ標籤結束函式
  if (event.target.tagName !== 'A') {
    return
  }
  // console.log(event.target.dataset.page)測試
  const page = Number(event.target.dataset.page) //轉為數字

  renderUserList(getPersonByPage(page))
})

// id
// name
// surname
// email
// gender
// age
// region
// birthday
// avatar - 圖片位址
