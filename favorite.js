const Base_URL = "https://lighthouse-user-api.herokuapp.com";
const index_URL = Base_URL + "/api/v1/users/";
const container = document.querySelector("#user-list"); //放使用者清單的容器節點

const Persons = JSON.parse(localStorage.getItem('Favorite')) || []
renderUserList(Persons)


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
          <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}" id>x</button>
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

//刪除最愛函式
function removeFromFavorite(id) {
  const personIndex = Persons.findIndex(person => person.id === id)
  // console.log(personIndex) //測試回傳是否是正確的索引值
  //刪除
  Persons.splice(personIndex, 1)

  //刪除之後要重新存回local
  localStorage.setItem('Favorite', JSON.stringify(Persons))

  //即時重現頁面
  renderUserList(Persons)
}



//給container掛上監聽器
container.addEventListener("click", function onPersonClick(event) {
  let target = event.target;
  // console.log(target) //測試

  //如果點擊到的class含有這個
  if (target.matches('.btn-show-person')) {
    showUserModal(Number(target.dataset.id))//dataset.id取出來的是字串要轉成數字才能用
  } else if (target.matches('.btn-remove-favorite')) {
    // console.log(target) //測試
    removeFromFavorite(Number(target.dataset.id))
  }

  // console.log(Number(target.dataset.id)) //601
  // console.log(typeof Number(target.dataset.id)) //number
});


