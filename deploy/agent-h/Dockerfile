FROM python:3.12-slim
WORKDIR /app
COPY alejandro-cto/agent-h/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
COPY alejandro-cto/agent-h /app/alejandro-cto/agent-h
COPY commun /app/commun
COPY henriquet-cdo/sessions/photos /app/henriquet-cdo/sessions/photos
COPY henriquet-cdo/donnees /app/henriquet-cdo/donnees
COPY deploy/agent-h/worker.py /app/worker.py
ENV PYTHONUNBUFFERED=1
CMD ["python", "worker.py"]
