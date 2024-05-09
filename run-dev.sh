docker stop tropsy-proxy-server
docker rm tropsy-proxy-server

docker build . -t tropsy-proxy-server
docker run -v ./:/app -p 7757:7757 --network=host --name=tropsy-proxy-server -it tropsy-proxy-server