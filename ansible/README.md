# Ansible Automation

This playbook toggles the NGINX ingress controller addon on Minikube and waits until the controller deployment is ready.

## Usage

```bash
cd ansible
ansible-playbook -i inventory install_ingress.yaml
```

The inventory targets the local machine (`localhost`) with `ansible_connection=local`, so no SSH configuration is required. Run the playbook after `minikube start` to ensure the ingress controller is installed before deploying the rest of the stack.
