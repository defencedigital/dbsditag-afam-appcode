# d2s-pipeline-start2finish-appcode

This repo is one of three used by the [D2S Pipeline Start to Finish](https://defencedigital.atlassian.net/wiki/spaces/D2SUHub/pages/247595056/Pipeline+Start+to+Finish) guide, which provides a complete example workflow to get up and running in on the `D2S OpenShift platform`

- d2s-pipeline-start2finish-appcode (*this repo*) - contains the application code that is used by the CICD process to build a container image
- [d2s-pipeline-start2finish-manifests](https://github.com/defencedigital/d2s-pipeline-start2finish-manifests) - contains the Kubernetes manifests that deploy the image to the D2S OpenShift platform
- [d2s-pipeline-start2finish-cicd](https://github.com/defencedigital/d2s-pipeline-start2finish-cicd) - contains the OpenShift Pipelines ([Tekton](https://tekton.dev/)) code (`CI`), and the OpenShift GitOps ([ArgoCD](https://argo-cd.readthedocs.io/en/stable/)) code (`CD`)

## Application code

Is uses the GOV.UK Design System for [Service unavailable pages](https://design-system.service.gov.uk/patterns/service-unavailable-pages/), with the sections highlighted below provided by an [Kubernetes ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/), so that a *service outage* base image can be created and re-used for multiple scenarios

This blueprint can also be used on it's own, please refer to the [D2S Pipeline Start to Finish](https://defencedigital.atlassian.net/wiki/spaces/D2SUHub/pages/247595056/Pipeline+Start+to+Finish) guide for details of how to use this

![image](https://github.com/defencedigital/test-pipelines-s2f/assets/129990602/03cfe3b9-c8d1-407c-9e56-a875f739cef4)

![image](https://github.com/defencedigital/d2s-pipeline-start2finish-appcode/assets/129990602/fde55fc8-cf68-466c-8e16-f43462849c9f)


