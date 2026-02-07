import { Component, OnInit } from '@angular/core';
import { CompareclgService } from 'app/modules/service/compareclg.service';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

  examListArr: any = [];
  articlesArr: any = [];
  itemsToShow: number = 10;
  ArticlesToShow: number = 10;
  activeTabIndex: number = 0;
  
  constructor(public CompareclgService: CompareclgService) { }

  ngOnInit(): void {
    this.getExamList();
    this.getBlogs();
  }

  getExamList() {
    this.CompareclgService.getExamList().subscribe(res => {
      // console.log(res);
      this.examListArr = res.response_data;
    })
  }

  getBlogs() {
    this.CompareclgService.getBlogs().subscribe(res => {
      // console.log(res);
      this.articlesArr = res.response_data;
    })
  }

  showMoreExams() {
    this.itemsToShow += 10;
  }

  showMoreArticles() {
    this.ArticlesToShow += 10;
  }
}
