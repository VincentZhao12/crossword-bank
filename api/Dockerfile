FROM python:3.8-slim-buster

WORKDIR /python-docker

COPY requirements.txt requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir sentence-transformers

COPY .env .env
COPY .flaskenv .flaskenv
COPY app.py app.py

EXPOSE 8080

CMD [ "gunicorn", "-b", "0.0.0.0:8080", "app:app"]