FROM python:2

RUN apt-get -y update && \
    apt-get -y install libopencv-dev libtesseract-dev git cmake build-essential libleptonica-dev liblog4cplus-dev libcurl3-dev beanstalkd && \
    pip install tornado

ADD webservice /webservice

ADD openalpr /storage/projects/alpr

RUN cd /storage/projects/alpr/src && \
      mkdir build && \
      cd build && \
      cmake -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_INSTALL_SYSCONFDIR:PATH=/etc .. && \
      make && \
      make install

RUN cd /storage/projects/alpr/src/bindings/python && \
      python setup.py install && \
      ln /dev/null /dev/raw1394 && \
      bash ./make.sh

CMD ln -s /dev/null /dev/raw1394; python /webservice/openalpr_web.py
