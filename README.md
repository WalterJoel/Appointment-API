# Reto Agendamiento de Citas

## Descripción

Serverless Appointment API. 

- Usamos **NestJS** con arquitectura modular.
- Aplicamos patrones **Provider** y **Singleton**.
- Seguimos principios **SOLID**.
- Integramos **AWS Secrets Manager** para gestionar credenciales.
- Validamos **inputs** del usuario con **validators y excepciones**.

## Probar API  desde SWAGGER

```bash
$ https://6jzgx4thnc.execute-api.us-east-1.amazonaws.com/api
```


## Instalación

```bash
$ npm install
```

## Ejecutar el App

```bash
# Local
$ sls offline

# Despliegue AWS (asegurar de tener configurado sus credenciales)
$ sls deploy
```

## Test

```bash
$ npm run test
```

## Documentación

Documentación Swagger autogenerada en `/api`
