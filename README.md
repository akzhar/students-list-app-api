# students-list-app-api

REST API для клиентской части приложения [students-list-app-client](https://github.com/akzhar/students-list-app-client)

API URL: https://students-list-app-api.herokuapp.com

<a id="up"></a>

## Содержание
- [1. Деплой API](#1)
	- [1.1 Создаем базу данных PostgreSQL](#1.1)
  - [1.2 Делаем форк и клонируем проект себе на ПК](#1.2)
  - [1.3 Создаем хранилище для фото на Google Drive](#1.3)
	- [1.4 Разворачиваем API на Heroku](#1.4)
- [2. Команды для работы с API из консоли в локальном репозитории](#2)
- [3. Тестирование API](#3)
- [4. Засыпание приложения на Heroku](#4)
	- [4.1 Проблема](#4.1)
	- [4.2 Устраняем проблему](#4.2)
	- [4.3 Проверяем результат](#4.3)

<a id="1"></a>

## <a href="#up">↑</a> 1. Деплой API

<a id="1.1"></a>

### <a href="#up">↑</a> 1.1 Создаем базу данных PostgreSQL

Для хранения информации о студентах будем использовать облачную базу данных PostgreSQL - ElephantSQL

1. Регистрируемся на [elephantsql.com](https://www.elephantsql.com)

2. Жмем зеленую кнопку `+ Create New Instance`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/1.png)

3. Указываем:

	- `Name`: любое
	
	- `Plan`: Tiny Turtle (Free)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/2.png)

4. Жмем кнопку `Select region`

5. Указываем

	- `Data center`: выбираем любой

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/3.png)

6. Жмем кнопку `Review` и далее `Create instance`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/4.png)

7. Получив сообщение `Instance successfully created`, открываем свой инстанс

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/5.png)

8. Записываем / запоминаем

	- `Server (address)`

	- `User & Default database`

	- `Password`

	- `URL`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/6.png)

9. Скачиваем и устанавливаем [pgAdmin](https://www.pgadmin.org/download)

10. Запускаем pgAdmin и подключаемся к ранее созданной базе данных: ПКМ на `Servers` → `Create` → `Server`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/7.png)

11. На вкладке `General` указываем любое и переходим на вкладку `Connection`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/8.png)

12.  На вкладке `Connection` указываем данные, полученные на 8-ом шаге

	- `Host name / address`
	
	- `Maintenace database`
	
	- `Username`
	
	- `Password`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/9.png)

13. Нажимаем `Connect` и, подключившись, находим наш инстанс в списке (Ctrl + F → `Database name`)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/10.png)

14. Создаем в нашей БД таблицу `students`: ПКМ на БД → `Query tool`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/11.png)

15. Вставляем в окно `Query editor` текст SQL запроса ниже  → нажимаем `Execute` (F5)

	```
	CREATE TABLE students(
		id SERIAL,
		name text NOT NULL,
		email text NOT NULL,
		rating int NOT NULL,
		age smallint NOT NULL,
		avatar text NOT NULL,
		spec text NOT NULL,
		"group" text NOT NULL,
		sex char(7) NOT NULL,
		favcolor text NOT NULL,
		PRIMARY KEY(id)
	);
	```

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/12.png)

16. Проверяем, что таблица с необходимыми полями успешно создалась: ПКМ на БД → `Query tool` → выполняем SQL запрос `SELECT * FROM students;`ИЛИ находим таблицу в дереве объектов → ПКМ на таблице → `View / Edit Data` → `All Rows` → проверяем что структура таблицы соответствует примеру на скриншоте ниже

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/13.png)

17. Аналогично таблице `students` создаем вторую таблицу `google_drive_tokens` для хранения токена авторизации в Google Drive

	```
	CREATE TABLE google_drive_tokens(
		id SERIAL,
		creation_date timestamp with time zone NOT NULL,
		refresh_token text UNIQUE NOT NULL,
		PRIMARY KEY(id)
	);
	```

<a id="1.2"></a>

### <a href="#up">↑</a> 1.2 Делаем форк и клонируем проект себе на ПК

1. Делаем форк данного репозитория и клонируем проект к себе на ПК: `git clone git@github.com:<ваш аккаунт на Github>/students-list-app-api.git`

2. Переходим в директорию проекта у себя на ПК, создаем в корне файл `.env` следующего содержания:
	```
	DB_URL=<URL для доступа к БД из 8-го шага в п. 1.1>
  GDRIVE_FOLDER_ID=<ID папки на Google Drive из 2-го шага в п. 1.3>
  GDRIVE_CLIENT_ID=<OAuth 2.0 Client ID из 11-го шага в п. 1.3>
  GDRIVE_CLIENT_SECRET=<OAuth 2.0 Client Secret из 11-го шага в п. 1.3>
	NODE_ENV=development // значение переменной будет автоматически заменено Heroku на 'production'
	```

<a id="1.3"></a>

### <a href="#up">↑</a> 1.3 Создаем хранилище для фото на Google Drive

Хранить загружаемые файлы (аватарки студентов) на платформе Heroku (на нее мы задеплоим проект в п. 1.4) к сожалению [не получится](https://help.heroku.com/K1PPS2WM/why-are-my-file-uploads-missing-deleted), поэтому нам понадобится отдельное хранилище для файлов - Google Drive

1. Создаем [Google аккаунт](https://accounts.google.com) и заводим [Google Drive](https://drive.google.com)

2. Создаем на Google Drive папку для хранения аватаров студентов и помещаем ID папки из адресной строки в переменную `GDRIVE_FOLDER_ID` в `.env` файле в корне локального репозитория

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/33.png)

3. Переходим в [Google API console](https://console.developers.google.com/?hl=ru) и создаем новый проект: указываем имя проекта (любое) → нажимаем `Create`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/34.png)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/35.png)

4. Переходим в раздел `OAuth consent screen` → выбираем User Type `External` → нажимаем `Create`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/36.png)

5. Заполняем обязательные поля: `App name`, `User support email`, `Developer contact information - email` → нажимаем `Save and continue`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/37.png)

6. Нажимаем `Add or remove scopes` → выбираем значение `https://www.googleapis.com/auth/drive` в списке Scopes → нажимаем `Update` → нажимаем `Save and continue`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/38.png)

7. В разделе Test users нажимаем `Add users` → вводим свой емейл → нажимаем `Add` → нажимаем `Save and continue`

  ![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/39.png)

8. Переходим в раздел `Credentials` → нажимаем `Create credentials` → `Create OAuth client ID`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/40.png)

9. Выбираем Application type `Web application`, даем любое имя для OAuth client

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/41.png)

10. Cпускаемся ниже и в разделе __Authorized JavaScript origins__ указываем адрес вашего приложения, а в разделе __Authorized redirect URIs__ добавляем к нему путь `/oauth2callback` → нажимаем `Create`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/42.png)

11. Копируем `Client ID` и `Client Secret` в `.env` файл в корне локального репозитория в переменные `GDRIVE_CLIENT_ID` и `GDRIVE_CLIENT_SECRET` соответственно

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/43.png)


<a id="1.4"></a>

### <a href="#up">↑</a> 1.4 Разворачиваем API на Heroku

1. Регистрируемся на [heroku.com](https://www.heroku.com) → `Create free account`

2. После регистрации нажимаем кнопку `New` → `Creat new app`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/14.png)

3. Даем приложению имя

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/15.png)

4. Устанавливаем [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli), в консоли переходим в директорию проекта `cd <имя приложения>/` и выполняем команды:

	- `heroku login` (откроет окно а браузере, в котором нужно будет подтвердить авторизацию)

	- подтверждаем авторизацию в браузере и возвращаемся в консоль

	- `heroku git:remote -a <имя приложения на Heroku>`

5. Возвращаемся на [dashboard.heroku.com/apps](https://dashboard.heroku.com/apps) и открываем наше приложение

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/16.png)

6. Вкладка `Deploy` → выбираем деплой через Github → авторизуемся в Github, выбираем репозиторий с форком

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/17.png)

7. Включаем опцию `Enable Automatic Deploys`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/18.png)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/19.png)

8. Переходим на вкладку `Settings` → выбираем пункт `Reveal Config Vars`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/20.png)

9. Добавляем `env` константы из 2-го шага (все кроме `NODE_ENV`). В консоли выполните команду `heroku labs:enable runtime-dyno-metadata -a <имя приложения на Heroku>`. Это добавит ряд системных env переменных, содержащих [метаданные Heroku окружения](https://devcenter.heroku.com/articles/dyno-metadata). В коде нашего приложения будет использована переменная `HEROKU_APP_NAME`.

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/21.png)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/44.png)

10. Откройте логи Heroku приложения: сделать это можно, нажав на `More` → `View logs` ИЛИ в консоли командой `npm run logs`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/22.png)

11. Убедитесь, что в логах значится код ошибки `H81 Blank-app` В [документации Heroku](https://devcenter.heroku.com/articles/error-codes#h81-blank-app) сказано, что этот код не является ошибкой и означает, что ни одного деплоя кода нашего приложения в git репозиторий Heroku еще не было выполнено

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/23.png)
	
	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/24.png)

12. Чтобы это исправить, нам надо сделать хотя бы один коммит и пуш в git репозиторий Heroku (в нашем случае Heroku будет брать обновления из ветки `main` в нашем репозитории на Github, поэтому пушить изменения нужно туда). Измените какой-либо файл в репозитории, например, измените заголовок в файле `README.md`.

13. Теперь перейдите в консоль и выполните команду `npm run deploy`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/25.png)

14. Смотрим логи нашего приложения (см. шаг 10) и убеждаемся, что наше API запущено по адресу `https://<имя приложения на Heroku>.herokuapp.com`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/26.png)

15. Переходим по адресу запущенного API `https://<имя приложения на Heroku>.herokuapp.com` и выполняем авторизацию нашего приложения в Google Drive

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/45.png)

16. Смотрим логи нашего приложения (см. шаг 10) и убеждаемся, что в логах появилось сообщение о том, что токен сохранен в БД

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/46.png)

16. Возвращаемся в БД и проверяем, что в действительно токен появился в таблице `google_drive_tokens` (см. шаг 16 в п. 1.1)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/46.png)

<a id="2"></a>

## <a href="#up">↑</a> 2. Команды для работы с API из консоли в локальном репозитории

- `npm run deploy` - быстрый деплой всех изменений в ваш Github репозиторий в ветку `main`, имя коммита `heroku deploy`. Heroku автоматически соберет и запустит новую версию приложения. Если необходимо дать нормальное имя коммиту необходимо заменить команду `npm run deploy` на 3 последовательные команды `git add .`,  `git commit -m "<commit name>"`,  `git push origin main`.
PS: все изменения лучше делать в отдельной ветке, тестировать локально (для запуска API локально есть скрипт `npm run dev`) и затем вливать проверенные изменения в ветку `main` таким образом совершая deploy на Heroku.

- `npm run logs` - открыть логи приложения прямо в консоли (также логи можно смотреть тут: `https://dashboard.heroku.com/apps/<имя приложения на Heroku>/logs`)

- `npm run app-off` - остановка приложения на Heroku

- `npm run app-on` - запуск приложения на Heroku

<a id="3"></a>

## <a href="#up">↑</a> 3. Тестирование API
 
Протестировать API можно с помощью [insomnia.rest](https://insomnia.rest/download)

__GET__ /students

![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/27.png)

__POST__ /student

![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/28.png)

__DELETE__ /student/:id

![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/29.png)

<a id="4"></a>

## <a href="#up">↑</a> 4. Засыпание приложения на Heroku

Есть отличная [статья на javarush.ru](https://javarush.ru/groups/posts/1987-malenjhkie-khitrosti-s-heroku), которая описывает проблему и пути ее решения.

<a id="4.1"></a>

### <a href="#up">↑</a> 4.1 Проблема

1. При регистрации бесплатного Heroku аккаунта вам дается 550 [free dyno hours](https://devcenter.heroku.com/articles/free-dyno-hours) в месяц. По сути это часы активности вашего приложения.

2. При отсутствии активности на протяжении 30 минут приложение на Heroku будет "засыпать. При первом обращении к нему оно "проснется", но время первого отклика будет сильно дольше обычного.

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/30.png)

<a id="4.2"></a>

### <a href="#up">↑</a> 4.2 Устраняем проблему

1. Чтобы увеличить кол-во `free dyno hours` - в настройках аккаунта на Heroku (`Account settings` → `Billing`) нужно привязать банковскую карту

2. Чтобы победить "засыпание" можно воспользоваться одним из сервисов пинговальщиков, например [Kaffeine](http://kaffeine.herokuapp.com/). Сервис будет пинговать наше приложение раз в 30 минут, не давая ему "спать"

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/31.png)

<a id="4.3"></a>

### <a href="#up">↑</a> 4.3 Проверяем результат

- Открываем логи и убеждаемся, что приложение Kaffeine "разбудило" наше приложение

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/32.png)
