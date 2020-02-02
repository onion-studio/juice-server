# juice

`npm run dev:build`
`npm run dev:up`
`npm run start`

# database.json

[db-migrate](https://db-migrate.readthedocs.io/en/latest/), [mysql](https://github.com/mysqljs/mysql) 사용 시 공통으로 참조하는 데이터베이스 연결 설정 파일. [db-migrate의 설정 파일 규칙](https://db-migrate.readthedocs.io/en/latest/Getting%20Started/configuration/)을 그대로 따른다.

# 로컬에서 Docker 이용해서 개발용 MySQL 띄우기

```bash
docker run -p 13306:3306 --name juice-db -e MYSQL_ROOT_PASSWORD=juice -e MYSQL_DATABASE=juice -e MYSQL_USER=juice -e MYSQL_PASSWORD=juice -d mysql:5.7
```

(포트번호 13306)

# db-migrate

## 마이그레이션 파일 생성

```
npx db-migrate create <migration_name> -e default --sql-file
```