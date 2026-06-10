#!/usr/bin/env bash
set -e
PROFILE=${1:-test}
PORT=${2:-8080}

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | sed -E 's/.*"([0-9]+)\..*/\1/')
JAVA_HOME_ACTIVE=$(java -XshowSettings:properties -version 2>&1 | grep 'java.home' | sed -E 's/.* = //')

if [ -z "$JAVA_VERSION" ]; then
  echo "ERROR: Unable to detect Java version. Install JDK 21 and ensure java is on PATH."
  exit 1
fi

if [ "$JAVA_VERSION" -lt 21 ]; then
  echo "ERROR: Java 21+ is required. Found version $JAVA_VERSION."
  exit 1
fi

if [ -n "$JAVA_HOME_ACTIVE" ] && [ "$JAVA_HOME" != "$JAVA_HOME_ACTIVE" ]; then
  echo "Detected java.home from java executable: $JAVA_HOME_ACTIVE"
  echo "Overriding JAVA_HOME for this session."
  export JAVA_HOME="$JAVA_HOME_ACTIVE"
fi

export SPRING_PROFILES_ACTIVE="$PROFILE"
export SERVER_PORT="$PORT"

echo "Starting backend with profile '$PROFILE' on port $PORT'..."
exec ./mvnw spring-boot:run
