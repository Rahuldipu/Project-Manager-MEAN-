import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/models/project.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: any;
  projects: any;
  selectedListId: string = '';
  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params.listId) {
        this.selectedListId = params.listId;
        this.taskService.getProjects(params.listId).subscribe((projects) => {
          this.projects = projects;
        })
      } else {
        this.projects = undefined;
      }

    })
    this.taskService.getList().subscribe((lists) => {
      this.lists = lists;
    })
  }

  onProjectClick(project: Project) {
    this.taskService.complete(project).subscribe(() => {
      console.log("completed successFully!");
      project.completed = !project.completed;
    })
  }

  onDeleteListClick() {
    this.taskService.deleteList(this.selectedListId).subscribe((res) => {
      this.router.navigate(['/lists']);
      console.log(res);
    })
  }
  

}
