# students-list-app REST API

REST API для React.js приложения [students-list-app](https://github.com/akzhar/students-list-app)

## Как задеплоить API

### Создаем базу данных PostgreSQL
1. Логинимся на [elephantsql.com](https://www.elephantsql.com) через GitHub / Google account
3. Жмем зеленую кнопку `+ Create new instance`
4. Указываем
- Name (любое)
- Plan: Tiny Turtle (Free)
5. Жмем кнопку `Select region`
6. Указываем
  - Data center (выбираем поближе)
7. Жмем кнопку `Review` и далее `Create instance`
8. Получив сообщение `Instance successfully created`, открываем свой инстанс
9. Копируем
- Server (address)
- User & Default database
- Password
- URL
10. Скачиваем и устанавливаем [pgAdmin](https://www.pgadmin.org/download)
11. Открываем pgAdmin и подлючаемся к ранее созданной БД: ПКМ → `Create...` → `Server`
12. Указываем имя (любое)
13. Перехоим на вкладку `Connection` и там указываем данные, полученные на 9 шаге:
- Адрес сервера
- Имя БД
- Имя пользователя
- Пароль
14. Нажимаем `Connect`
15. Подключившись, создаем в нашей БД таблицу `students`: ПКМ на БД → `Query tool` → копируем следующий SQL запрос → нажимаем `Run` (F5)
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
16. Делаем форк данного репозитория и клонируем его к себе на ПК
17. У себя на ПК создаем в корне файл `.env` следующего содержания:
```
DB_URL=<URL из 9 шага>
DB_TABLE_NAME=students
APP_NAME=<имя heroku приложения из шага 19>
NODE_ENV=development
```
18. Деплоить API будем на [heroku.com](https://www.heroku.com)
19. Регистрируемся на heroku → `Create free account`
20. После регистрации нажимаем кнопку `New` → `Creat new app` → даем имя как в `APP_NAME` из 17 шага
21. Устанавливаем [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli),в консоли переходим в директорию склонированного ранее форка и выполняем команды:
- `heroku login` (откроет окно а браузере, в котором нужно будет подтвердить авторизацию)
- возвращаемся в консоль
- `heroku git:remote -a <имя heroku приложения из шага 20 (должно быть таким же как `APP_NAME` из 17 шага)>` - это нужно, чтобы работали скрипты в package.json
22. Переходим [сюда](https://dashboard.heroku.com/apps)
23. Открываем наше приложение → вкладка `Deploy`
24. Выбираем деплой через Github → авторизуемся в Github, выбираем репозиторий с форком
25. Включаем опцию `Automatic deploys from main are enabled`
26. Переходим на вкладку `Settings` → выбираем пункт `Reveal Config Vars`
27. Прописываем env константы из 17 шага (все кроме `NODE_ENV`)
28. Измените содержимое файла `README.md` (любое незначительное изменение, например, поставьте точку в конец предложения)
29. Переходим в консоль и выполняем команду `npm run deploy` (чтобы запусть приложения нужно сделать хотя бы один коммит и пуш в репозиторий heroku)
30. Теперь API запущено по адресу `https://<имя heroku приложения из шага 20>.herokuapp.com`
31. Полезные команды для консоли из директории с API:
- `npm run deploy` - деплой изменений в ваш форк, а из него heroku возьмет обновления сам
- `npm run logs` - открыть логи приложения прямо в консоли (также можно смотреть логи тут: `https://dashboard.heroku.com/apps/<имя heroku приложения из шага 20>/logs`)
- `npm run app-off` - остановка приложения
- `npm run app-on` - запуск приложения

ИЛИ вместо шагов 28 и 29 можно:

Вкладка `Resources`
Напротив строки `web node index.js` включить переключатель в положение `вкл` → `Confirm`

Потестировать API можно с помощью [insomnia.rest](https://insomnia.rest/download)
