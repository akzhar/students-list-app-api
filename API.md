# Описание API

## Авторизация в Google Drive

Аватарки студентов приложение будет хранить в папке на Google Drive

[Авторизовать приложение](/oauth2)
## Получение списка студентов

[__GET__ /students](/students)

Коды ответов:

- 200 ОК

- 503 Service Unavailable

Пример:

- Request:

	- URL: GET /students

- Response:

	- Status: 200 OK

	- Body: массив, содержащий структуры типа `Student`:

		```
		{
			"id": 1,
			"name": "Сахаров Николай",
			"email": "nikolay.saharov@yandex.ru",
			"rating": 34,
			"age": 19,
			"avatar": "https://drive.google.com/uc?export=view&id=1qQpCAKB2AI4Q_3kyb-KhfMLGuJaQ6PBO",
			"spec": "Прикладная информатика",
			"group": "ПИ-101",
			"sex": "Мужской",
			"favcolor": "blue"
		}
		```

## Добавление студента

__POST__ /student

Коды ответов

- 200 ОК

- 400 Bad Request

Пример:

- Request:

	- URL: POST /student (с заголовком 'Content-Type': `multipart/form-data`)

	- Body: структура `Student` аналогичная описанной выше. В поле `avatar` файл в любом из следующих форматов: png, jpg, jpeg. Если файла нет, будет установлен default аватар

- Response:

	- Status: 200 OK

	- Body: структура `Student`, в поле `avatar` ссылка на файл, сохраненный на Google Drive

## Удаление студента

__DELETE__ /student/:id

Коды ответов

- 200 ОК

- 404 Not found

Пример:

- Request:

	- URL: DELETE /student/1

- Response:

	- Status: 200 OK

	- Body: `id` удаленного студента

# Github репозиторий API

[students-list-app-api](https://github.com/akzhar/students-list-app-api)

# Github репозиторий клиентской части

[students-list-app-client](https://github.com/akzhar/students-list-app-client)
