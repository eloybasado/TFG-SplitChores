Este TFG para el grado en Ingeniería Multimedia de la Universidad de Alicante ha sido realizado por Eloy Paredes Muñiz durante en el curso 2023/2024.

Se facilita una pequeña guía para poder utilizar la aplicación.

Se recomienda tener instalado Angular, Ionic, MongoDB, MongoDBcompass, NodeJS y ngrok.

Primero entrar a las carpetas backend y frontend y ejecutar el comando: npm install

Se debe crear un proyecto en Firebase y seguir la documentación oficial al momento de crear el proyecto, ya que puede variar.

Se debe obtener un archivo de credenciales con el que poder reemplazar los datos vacíos del archivo /backend/tfg-split-chores-firebase-adminsdk-7ndnx-d6e018fda8.json

Se deben seguir los pasos para la aplicación android que se especifique en Firebase, al momento del desarrollor de este proyecto se debía hacer el build para la app android con capacitor:

ionic capacitor add android
ionic build
ionic capacitor build android

Una vez generada la carpeta android, introducir el archivo google-services.json generado por Firebase en /android/src/

Es importante mantener la coherencia del archivo capacitor.config.ts, se recomienda mantener el nombre del proyecto y si no fuese posible, se debe sustituir por el nombre de tu proyector de firebase.

Con todo esto hecho, la aplicación y su servicio de notificaciones deberían funcionar, para poder utilizar nuestro backend desde un dispositivo físico, debemos utilizar ngrok.

En la terminal de ngrok escribimos el comando: ngrok http 3000 (o el puerto que hayas elegido si lo has modificado)
Ahora en el archivo environments.ts del frontend dejamos solo la ruta que nos facilita ngrok, se recomienda dejar la de desarrollo local comentada.

La carpeta assets con los recursos y el icono de la aplicación para android está en google drive: https://drive.google.com/drive/folders/1scQJuaXFHDW0k7cPTrhSYQDjPRP6RHpL?usp=drive_link