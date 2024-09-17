//переменные
const date = new Date();
const options = {
  day: "2-digit",
  month: "long",
  weekday: "long",
  timezone: "UTC",
};

const img = document.querySelector("img");
const form = document.querySelector("form");
const formInput = document.querySelector(".todo__input");
const formSubmitButton = document.querySelector(".todo__button");
const todoList = document.querySelector(".todo__list");
const buttonDeletedDone = document.querySelector(".todo__deleteAllButton");
const buttonGeo = document.querySelector(".geo");
const temp = document.querySelector(".weather");

let todoArray = [];

//Здесь создается объект с расшифровкой кода погоды. Ниже описание в оригинале
let weatherType = {
  0: "Ясное небо",
  1: "В основном ясно",
  2: "Переменная облачность",
  3: "Пасмурно",
  45: "Туман",
  48: "Образуется иней",
  51: "Небольшой моросящий дождь",
  53: "Умеренный моросящий дождь",
  55: "Интенсивный моросящий дождь",
  56: "Мелкий холодный дождь",
  57: "Интенсивный холодный дождь",
  61: "Мелкий дождь",
  63: "Умеренный дождь",
  65: "Интенсивный дождь",
  66: "Мелкий ледяной дождь",
  67: "Интенсивный ледяной дождь",
  71: "Выпадение снега: Незначительное",
  73: "Выпадение снега: Умеренное",
  75: "Выпадение снега: Интенсивное",
  77: "Снежная крупа",
  80: "Ливневые дожди: Незначительные",
  81: "Ливневые дожди: Умеренные",
  82: "Ливень: Сильный",
  85: "Небольшой снегопад",
  86: "Сильный снегопад",
  95: "Гроза небольшая",
  96: "Гроза с небольшим градом",
  99: "Гроза с сильным градом",
};

// WMO Weather interpretation codes (WW)
// Code	Description
// 0	Clear sky
// 1, 2, 3	Mainly clear, partly cloudy, and overcast
// 45, 48	Fog and depositing rime fog
// 51, 53, 55	Drizzle: Light, moderate, and dense intensity
// 56, 57	Freezing Drizzle: Light and dense intensity
// 61, 63, 65	Rain: Slight, moderate and heavy intensity
// 66, 67	Freezing Rain: Light and heavy intensity
// 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
// 77	Snow grains
// 80, 81, 82	Rain showers: Slight, moderate, and violent
// 85, 86	Snow showers slight and heavy
// 95 *	Thunderstorm: Slight or moderate
// 96, 99 *	Thunderstorm with slight and heavy hail

//смена обоев
function changeWrap(hour) {
  if (hour >= 0 && hour < 6) {
    img.src = "./public/images/01.jpg";
    img.alt = "ночь";
  } else if (hour >= 6 && hour < 12) {
    img.src = "./public/images/02.jpg";
    img.alt = "утро";
  } else if (hour >= 12 && hour < 18) {
    img.src = "./public/images/03.jpg";
    img.alt = "обед";
  } else {
    img.src = "./public/images/04.jpg";
    img.alt = "вечер";
  }
}

//запрос даты по интервалу
setInterval(() => {
  const formattedDate = date.toLocaleString("ru-RU", options);
  //получаем час для смены обоев
  let hour = date.getHours();
  changeWrap(hour);
  //меняем местами день недели и дату - чтобы подходил формат по заданию
  let arrDate = formattedDate.split(", ");
  let weekDay = arrDate.splice(0, 1);
  arrDate.push(weekDay[0]);

  document.querySelector(".currentTime").textContent = arrDate.join(", ");
}, 500);

//проверка локалстора на наличие туду
if (localStorage.getItem("todo")) {
  todoArray = JSON.parse(localStorage.getItem("todo"));
  displayTodo();
  //проверим, есть ли выполненные задачи, чтобы вывести кнопку удаления
  showDeleteButton();
}

//сабмит формы
form.addEventListener("submit", (event) => {
  event.preventDefault();

  let todo = {
    value: formInput.value,
    checked: false,
    //уникальный id без библиотек
    id: Math.random().toString(10).slice(2, 7),
  };

  todoArray.push(todo);
  displayTodo();
  formInput.value = "";
  localStorage.setItem("todo", JSON.stringify(todoArray));
});

//отображение туду в разметке
function displayTodo() {
  let newTodo = "";
  todoArray.forEach((item) => {
    newTodo += `
    <li class='todo__li'>
      <input style='margin-right: 10px; width: 20px;
      height: 20px;' type='checkbox' id=${item.id} ${
      item.checked ? "checked" : ""
    }>
    <p style='width: 100%; font-weight: 400; text-decoration: ${
      item.checked ? "line-through" : "none"
    };'>${item.value}</p>
      <img style='object-fit: cover' src="./public/icons/Delete.svg" alt="корзина">
    </li>
    `;
    todoList.innerHTML = newTodo;
  });
}

//удаление туду по клику на корзинку
todoList.addEventListener("click", (event) => {
  if (event.target.tagName == "IMG") {
    let element = event.target.closest(".todo__li");
    let elementInput = element.querySelector("input[type=checkbox]");
    let elementId = elementInput.id;
    //далее сама функция удаления
    deleteTodo(element, elementId);
  }
});

//если слишком быстро удалять туду - разметка не успеет засинхрониться с локалстор. Ниже решение.
//добавляем задачи в очередь задач таймаутом
let debounce;

function deleteTodo(element, id) {
  if (debounce) return;
  debounce = true;

  let elemIndex = todoArray.findIndex((item) => {
    return item.id === id;
  });
  todoArray.splice(elemIndex, 1);
  //проверим, есть ли выполненные задачи, чтобы вывести кнопку удаления
  showDeleteButton();
  element.remove();
  localStorage.setItem("todo", JSON.stringify(todoArray));
  setTimeout(() => {
    debounce = false;
  }, 100);
}

//добавление стилей при клике на чекбокс и обновление массива туду
todoList.addEventListener("change", (event) => {
  let elemId = event.target.getAttribute("id");
  let elemIndex = todoArray.findIndex((item) => {
    return item.id == elemId;
  });

  todoArray[elemIndex] = {
    ...todoArray[elemIndex],
    checked: !todoArray[elemIndex].checked,
  };

  localStorage.setItem("todo", JSON.stringify(todoArray));

  if (todoArray[elemIndex].checked) {
    let element = event.target.closest(".todo__li");
    let text = element.querySelector("p");
    text.style.textDecoration = "line-through";
  } else {
    let element = event.target.closest(".todo__li");
    let text = element.querySelector("p");
    text.style.textDecoration = "none";
  }
  //проверим, есть ли выполненные задачи, чтобы вывести кнопку удаления
  showDeleteButton();
});

//функция удаления туду и обновления массива
buttonDeletedDone.addEventListener("click", () => {
  let doneTodo = todoArray.filter((item) => {
    return item.checked == true;
  });

  let arrInputs = document.querySelectorAll("input[type=checkbox]");

  arrInputs.forEach((item) => {
    for (let i = 0; i < doneTodo.length; i++) {
      if (item.id == doneTodo[i].id) {
        return item.closest(".todo__li").remove();
      }
    }
  });

  let arrWithoutDone = todoArray.filter((item) => {
    return item.checked == false;
  });

  todoArray = arrWithoutDone;
  //проверим, есть ли выполненные задачи, чтобы вывести кнопку удаления
  showDeleteButton();

  localStorage.setItem("todo", JSON.stringify(todoArray));
});

//функция для появления/скрытия кнопки удаления выполненных задач
function showDeleteButton() {
  let isAnyChecked = todoArray.some((item) => item.checked);

  if (isAnyChecked) {
    buttonDeletedDone.classList.add("todo__deleteAllButton_open");
  } else {
    buttonDeletedDone.classList.remove("todo__deleteAllButton_open");
  }
}

//подтягиваем из стора геолокацию, если ранее записали
if (localStorage.getItem("town")) {
  let town = localStorage.getItem("town");
  const newStr = town.replace(/"/g, "");
  buttonGeo.textContent = newStr;
}
//подтягиваем из погоду из стора, если ранее записали
if (localStorage.getItem("weather")) {
  let town = localStorage.getItem("weather");
  const newStr = town.replace(/"/g, "");
  temp.textContent = newStr;
}

//находим геолокацию
buttonGeo.addEventListener("click", () => {
  const geo = navigator;
  let hour = date.getHours();
  geo.geolocation.getCurrentPosition(
    (position) => {
      let { latitude, longitude } = position.coords;
      //запрос погоды и типа погоды
      getTempAndTypeWeather(latitude, longitude)
        .then((res) => {
          temp.textContent =
            "Сейчас" +
            " " +
            weatherType[res.hourly.weather_code[hour]] +
            " " +
            res.hourly.temperature_2m[hour] +
            " " +
            "\u00B0" +
            "C";
          localStorage.setItem(
            "weather",
            JSON.stringify(
              "Сейчас" +
                " " +
                weatherType[res.hourly.weather_code[hour]] +
                " " +
                res.hourly.temperature_2m[hour] +
                " " +
                "\u00B0" +
                "C"
            )
          );
        })

        .catch((error) => (temp.textContent = error));
      //запрос гео
      getCityByCoordinates(latitude, longitude)
        .then((city) => {
          buttonGeo.textContent = city;
          localStorage.setItem("town", JSON.stringify(city));
        })
        .catch((error) => (buttonGeo.textContent = error));
    },
    //если не дали доступ к гео
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        buttonGeo.textContent = "Увы, Вы не дали доступ к местоположению";
      } else {
        buttonGeo.textContent = "Не удалось получить местоположение";
      }
    }
  );
});

//функция спрашивает температуру и тип погоды
async function getTempAndTypeWeather(latitude, longitude) {
  const response = await fetch(
    ` https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&forecast_days=1&timezone=UTC`
  );

  const data = await response.json();
  if (data) {
    return data;
  }
}

//функция спрашивает у карт обратное геокадрирование
async function getCityByCoordinates(lat, long) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`
  );
  const data = await response.json();

  if (data && data.address) {
    return (
      data.address.city ||
      data.address.town ||
      data.address.village ||
      "Краснодар"
    );
  } else {
    ("Краснодар");
  }
}

//каждый час обновляем погоду автоматически
setInterval(() => {
  getTempAndTypeWeather(latitude, longitude).then((res) => {
    temp.textContent =
      "Сейчас" +
      " " +
      weatherType[res.hourly.weather_code[hour]] +
      " " +
      res.hourly.temperature_2m[hour] +
      " " +
      "\u00B0" +
      "C";
    localStorage.setItem(
      "weather",
      JSON.stringify(
        "Сейчас" +
          " " +
          weatherType[res.hourly.weather_code[hour]] +
          " " +
          res.hourly.temperature_2m[hour] +
          " " +
          "\u00B0" +
          "C"
      )
    );
  });
}, 3600000);
