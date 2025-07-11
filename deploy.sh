

#!/bin/bash
# Load environment variables at the start
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
else
    echo ".env file not found"
    exit 1
fi


docker build --platform linux/amd64 --no-cache -t $IMAGE_NAME:latest .

# Save and compress the docker image
echo "Saving and compressing docker image..."
TAR_FILE_NAME="btc-tools-site.tar.gz"
docker save $IMAGE_NAME:latest | gzip > $TAR_FILE_NAME

# Transfer files to remote server using environment variables
echo "Transferring to remote server..."
scp -i "${SSH_KEY_PATH}" -o PreferredAuthentications=publickey -o StrictHostKeyChecking=no $TAR_FILE_NAME docker-compose.yml "${LINODE_USERNAME}@${LINODE_SERVER}:~/"

# Execute remote commands to reload the container
echo "Deploying on remote server..."

ssh -i "${SSH_KEY_PATH}" -o PreferredAuthentications=publickey -o StrictHostKeyChecking=no "${LINODE_USERNAME}@194.195.214.234" "
    sudo mkdir -p $TARGET_PATH && \
    sudo mv ~/$TAR_FILE_NAME $TARGET_PATH && \
    sudo mv ~/docker-compose.yml $TARGET_PATH && \
    cd $TARGET_PATH && \
    sudo docker load < $TAR_FILE_NAME && \
    sudo docker-compose down && \
    sudo docker-compose up -d && \
    sudo rm $TAR_FILE_NAME
"

# Clean up local tar file
rm $TAR_FILE_NAME
