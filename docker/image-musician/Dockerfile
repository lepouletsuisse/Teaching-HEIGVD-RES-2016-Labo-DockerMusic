FROM node:4.3.1
MAINTAINER Samuel Darcey <samuel.darcey@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/app/

ENTRYPOINT ["node", "/opt/app/musician.js"]

#CMD ["node", "/opt/app/musician.js"]
