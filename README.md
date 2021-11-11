# LinX application

Microservices for LinX

## Development

### Ingress-nginx installation

https://kubernetes.github.io/ingress-nginx/deploy/#docker-for-mac

`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.43.0/deploy/static/provider/cloud/deploy.yaml`

### Start development environment

`skaffold dev`

### Create secret in k8

`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf`

### Update common module and push to npm registry

`cd common`

`npm run pub`

### Update common module dependency in LinX

`cd LinX`

`npm update @linX/common`

### Running test in LinX

`cd LinX`

`npm run test`

### Development only port forwarding

`kubectl get pods`

`kubectl port-forward nats-depl-75854b5b89-dbbdz 4222:4222`

### Install doctl

`brew install doctl`

### Authentication

`doctl auth init` and paste in the generated token

### Get connection info for our new cluster

`doctl kubernetes cluster kubeconfig save <cluster_name>`

### List all contexts

`kubectl config view`

### Use a different context

`kubectl config use-context <context_name>`

### Add Docker Hub account information as a secret in GitHub

`Settings > Secrets > New repository secret`

### Create secrets in cluster

`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf`

### Install ingress-nginx in cluster

https://kubernetes.github.io/ingress-nginx/deploy/#digital-ocean

`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.43.0/deploy/static/provider/do/deploy.yaml`

### Add HTTPS

see cert-manager.io

### Add Email support

see Mailchimp/Sendgrid
