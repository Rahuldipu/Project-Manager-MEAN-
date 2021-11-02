import { Injectable } from '@angular/core';
import { Project } from './models/project.model';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  getList(){
    return this.webReqService.get('lists');
  }

  createList(title: string){
    return this.webReqService.post('lists', { title });
  }

  updateList(id: string, title: string){
    return this.webReqService.patch(`lists/${id}`, { title });
  }

  deleteList(id: string) {
    return this.webReqService.delete(`lists/${id}`);
  }

  getProjects(listId: string){
    return this.webReqService.get(`lists/${listId}/projects`);
  }

  createProject(title: string, description: string, listId: string){
    return this.webReqService.post(`lists/${listId}/projects`, { title, description });
  }

  complete(project: Project){
    return this.webReqService.patch(`lists/${project._listId}/projects/${project._id}`, {
      completed: !project.completed
    })
  }


}
