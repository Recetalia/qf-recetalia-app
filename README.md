# MedicsRecetaliaApp
# build image
docker build -t farmacias-recetalia-app .

# VPN up

# Tag
docker tag farmacias-recetalia-app:latest farmacias-recetalia-app:1.0.0


# docker run local
docker run -d --name farmacias-recetalia-app -p 4201:80 -t farmacias-recetalia-app

# docker run develop
docker run -d --name farmacias-recetalia-app -p 4201:80 -t farmacias-recetalia-app

# push to registry
docker push farmacias-recetalia-app

##### docker run consuming a different api than api Url: 'http://localhost:8060'
