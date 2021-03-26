# students-list-app-api

REST API для клиентской части приложения [students-list-app-client](https://github.com/akzhar/students-list-app-client)

API URL: https://students-list-app-api.herokuapp.com

<a id="up"></a>

## Содержание
- [1. Деплой API](#1)
	- [1.1 Создаем базу данных PostgreSQL](#1.1)
	- [1.2 Разворачиваем API на Heroku](#1.2)
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

8. Копируем

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

12.  На вкладке `Connection` указываем данные, полученные на 8-ом шаге:

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

<a id="1.2"></a>

### <a href="#up">↑</a> 1.2 Разворачиваем API на Heroku

1. Делаем форк данного репозитория и клонируем проект к себе на ПК: `git clone git@github.com:<ваш аккаунт на Github>/students-list-app-api.git`

2. Переходим в директорию проекта у себя на ПК, создаем в корне файл `.env` следующего содержания:
	```
	DB_URL=<URL из 8-го шага>
	DB_TABLE_NAME=students
	APP_NAME=<имя приложения на Heroku> - понадобится на 5-ом шаге
	NODE_ENV=development
	```

3. Регистрируемся на [heroku.com](https://www.heroku.com) → `Create free account`

4. После регистрации нажимаем кнопку `New` → `Creat new app`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/14.png)

5. Даем приложению имя как в `APP_NAME` из 2-го шага

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/15.png)

6. Устанавливаем [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli), в консоли переходим в директорию проекта `cd <имя приложения>/` и выполняем команды:

	- `heroku login` (откроет окно а браузере, в котором нужно будет подтвердить авторизацию)

	- подтверждаем авторизацию в браузере и возвращаемся в консоль

	- `heroku git:remote -a <имя приложения на Heroku>` - значение `APP_NAME` из 2-го шага

7. Возвращаемся на [dashboard.heroku.com/apps](https://dashboard.heroku.com/apps) и открываем наше приложение

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/16.png)

8. Вкладка `Deploy` → выбираем деплой через Github → авторизуемся в Github, выбираем репозиторий с форком

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/17.png)

9. Включаем опцию `Enable Automatic Deploys`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/18.png)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/19.png)

10. Переходим на вкладку `Settings` → выбираем пункт `Reveal Config Vars`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/20.png)

11. Добавляем `env` константы из 2-го шага (все кроме `NODE_ENV`)

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/21.png)

12. Откройте логи Heroku приложения: сделать это можно, нажав на `More` → `View logs` ИЛИ в консоли командой `npm run logs`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/22.png)

13. Убедитесь, что в логах значится код ошибки `H81 Blank-app` В [документации Heroku](https://devcenter.heroku.com/articles/error-codes#h81-blank-app) сказано, что этот код не является ошибкой и означает, что ни одного деплоя кода нашего приложения в git репозиторий Heroku еще не было выполнено

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/23.png)
	
	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/24.png)

14. Чтобы это исправить, нам надо сделать хотя бы один коммит и пуш в git репозиторий Heroku (в нашем случае Heroku будет брать обновления из ветки `main` в нашем репозитории на Github, поэтому пушить изменения нужно туда). Измените какой-либо файл в репозитории, например, измените заголовок в файле `README.md`.

15. Теперь перейдите в консоль и выполните команду `npm run deploy`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/25.png)

16. Смотрим логи нашего приложения (см. шаг 12) и убеждаемся, что наше API запущено по адресу `https://<имя приложения на Heroku>.herokuapp.com`

	![step visualization](https://raw.githubusercontent.com/akzhar/readme-demos-media/main/students-list-app/api/26.png)

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
