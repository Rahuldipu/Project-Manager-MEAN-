import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit {

  listId: string = "";
  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.listId = params['listId'];
      console.log(this.listId);
    })
  }

  createProject(title: string, description: string){
    this.taskService.createProject(title, description, this.listId).subscribe((newProject) => {
      this.router.navigate(['../'], { relativeTo: this.route});
    })
  }

}
