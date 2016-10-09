#!/bin/bash
git pull
tmux kill-session -t stopcozi
tmux new -d -s stopcozi
tmux send -t stopcozi "mvn clean install" ENTER
tmux send -t stopcozi "java -jar ~/.m2/repository/gov/ithub/stopcozi/0.0.1-SNAPSHOT/stopcozi-0.0.1-SNAPSHOT.jar" ENTER

